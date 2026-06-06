import Cita from '../models/Cita.js';
import EvaluacionCompra from '../models/EvaluacionCliente.js';
import Interes from '../models/Interes.js';
import VisitaCliente from '../models/VisitaCliente.js';
import Propiedad from '../models/Propiedad.js';

/**
 * Reporte gerencial para consumo de n8n (Cron semanal → Gemini → PDF → Gmail).
 *
 * Devuelve datos YA agregados para que la automatización solo tenga que:
 *   1) pasar el JSON a la IA para el resumen/insights,
 *   2) maquetar y enviar.
 *
 * KPIs / ranking / citas-por-propiedad se calculan sobre la ventana `dias` (default 7).
 * Los `leads` (para lead scoring) y `resumenPorPropiedad` son acumulados, para que el
 * reporte tenga contenido aunque la semana haya sido tranquila.
 */
export const reporteSemanal = async (req, res) => {
    try {
        const dias = Math.min(Math.max(parseInt(req.query.dias, 10) || 7, 1), 365);
        const hasta = new Date();
        const desde = new Date(hasta.getTime() - dias * 24 * 60 * 60 * 1000);

        // ---- Citas agendadas en la ventana ----
        const citasPeriodo = await Cita.find({ createdAt: { $gte: desde } })
            .populate('vendedor', 'name email')
            .populate('propiedad', 'titulo ubicacion precio');

        const resumen = {
            citasAgendadas: citasPeriodo.length,
            citasPendientes: citasPeriodo.filter(c => c.estado === 'pendiente').length,
            citasAceptadas: citasPeriodo.filter(c => c.estado === 'aceptada').length,
            citasCanceladas: citasPeriodo.filter(c => c.estado === 'cancelada').length,
            citasEjecutadas: citasPeriodo.filter(c => c.ejecutada).length,
            leadsNuevos: await EvaluacionCompra.countDocuments({ createdAt: { $gte: desde } }),
            interesesNuevos: await Interes.countDocuments({ createdAt: { $gte: desde } }),
            visitasPropiedades: await VisitaCliente.countDocuments({ timestamp: { $gte: desde } }),
        };

        // ---- Ranking de vendedores por citas (en la ventana) ----
        const vendMap = new Map();
        for (const c of citasPeriodo) {
            const v = c.vendedor;
            if (!v) continue;
            const key = String(v._id);
            const e = vendMap.get(key) || { nombre: v.name, email: v.email, citas: 0, ejecutadas: 0, canceladas: 0 };
            e.citas += 1;
            if (c.ejecutada) e.ejecutadas += 1;
            if (c.estado === 'cancelada') e.canceladas += 1;
            vendMap.set(key, e);
        }
        const rankingVendedores = [...vendMap.values()].sort((a, b) => b.citas - a.citas);

        // ---- Citas por propiedad (en la ventana) ----
        const propCitaMap = new Map();
        for (const c of citasPeriodo) {
            const p = c.propiedad;
            if (!p) continue;
            const key = String(p._id);
            const e = propCitaMap.get(key) || { titulo: p.titulo, ubicacion: p.ubicacion, precio: p.precio, citas: 0 };
            e.citas += 1;
            propCitaMap.set(key, e);
        }
        const citasPorPropiedad = [...propCitaMap.values()].sort((a, b) => b.citas - a.citas);

        // ---- Leads para lead scoring (acumulado, top 25 recientes) ----
        const evals = await EvaluacionCompra.find()
            .sort({ createdAt: -1 })
            .limit(25)
            .populate('cliente', 'name email phone')
            .populate('propiedadInteres', 'titulo precio');

        const leads = evals.map(e => {
            const ingresoTotal = (e.ingresos?.sueldo || 0) + (e.ingresos?.otros || 0) + (e.ingresos?.conyuge || 0);
            const egresoTotal = Object.values(e.egresos || {})
                .reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
            return {
                cliente: e.cliente?.name || 'N/D',
                email: e.cliente?.email || null,
                telefono: e.cliente?.phone || null,
                propiedad: e.propiedadInteres?.titulo || 'N/D',
                tipoCompra: e.tipoCompra,
                tiempoCompra: e.tiempoCompra,
                nivelPotencial: e.nivelPotencial,
                porcentaje: e.porcentaje ?? null,
                buro: e.buro || null,
                ingresoMensual: ingresoTotal,
                egresoMensual: egresoTotal,
                capacidadAhorroMensual: ingresoTotal - egresoTotal,
                valorPropiedad: e.valorPropiedad || null,
                valorTotalInmuebles: e.valorTotalInmuebles || null,
                tieneEntrada30: !!e.tieneEntrada30,
                antiguedadAnios: e.antiguedadAnios ?? null,
                plazoCreditoAnios: e.plazoCreditoAnios ?? null,
                fecha: e.createdAt,
            };
        });

        // ---- Resumen por propiedad (acumulado) ----
        const [interesAgg, evalAgg, citaAgg, visitaAgg] = await Promise.all([
            Interes.aggregate([{ $group: { _id: '$propiedad', n: { $sum: 1 } } }]),
            EvaluacionCompra.aggregate([{
                $group: {
                    _id: '$propiedadInteres',
                    total: { $sum: 1 },
                    contado: { $sum: { $cond: [{ $eq: ['$tipoCompra', 'contado'] }, 1, 0] } },
                    credito: { $sum: { $cond: [{ $eq: ['$tipoCompra', 'credito'] }, 1, 0] } },
                    avgValor: { $avg: '$valorPropiedad' },
                },
            }]),
            Cita.aggregate([{ $group: { _id: '$propiedad', n: { $sum: 1 } } }]),
            VisitaCliente.aggregate([{ $group: { _id: '$propiedad', n: { $sum: 1 } } }]),
        ]);

        const propMap = new Map();
        const ensure = (id) => {
            const key = String(id);
            if (!propMap.has(key)) {
                propMap.set(key, { interesados: 0, evaluaciones: 0, contado: 0, credito: 0, avgValor: null, citas: 0, visitas: 0 });
            }
            return propMap.get(key);
        };
        interesAgg.forEach(d => { if (d._id) ensure(d._id).interesados = d.n; });
        evalAgg.forEach(d => {
            if (!d._id) return;
            const e = ensure(d._id);
            e.evaluaciones = d.total; e.contado = d.contado; e.credito = d.credito; e.avgValor = d.avgValor;
        });
        citaAgg.forEach(d => { if (d._id) ensure(d._id).citas = d.n; });
        visitaAgg.forEach(d => { if (d._id) ensure(d._id).visitas = d.n; });

        const propIds = [...propMap.keys()];
        const propsInfo = await Propiedad.find({ _id: { $in: propIds } })
            .select('titulo ubicacion precio tipo estado');
        const infoMap = new Map(propsInfo.map(p => [String(p._id), p]));

        const resumenPorPropiedad = propIds
            .map(id => {
                const info = infoMap.get(id);
                if (!info) return null;
                const m = propMap.get(id);
                const ticketPromedio = m.avgValor || info.precio || 0;
                return {
                    titulo: info.titulo,
                    ubicacion: info.ubicacion,
                    tipo: info.tipo,
                    estado: info.estado,
                    precio: info.precio,
                    interesados: m.interesados,
                    evaluaciones: m.evaluaciones,
                    contado: m.contado,
                    credito: m.credito,
                    citas: m.citas,
                    visitas: m.visitas,
                    ticketPromedio: Math.round(ticketPromedio),
                    actividad: m.interesados + m.evaluaciones + m.citas + m.visitas,
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.actividad - a.actividad)
            .slice(0, 10);

        res.json({
            generadoEn: hasta.toISOString(),
            periodo: { desde: desde.toISOString(), hasta: hasta.toISOString(), dias },
            resumen,
            rankingVendedores,
            citasPorPropiedad,
            leads,
            resumenPorPropiedad,
        });
    } catch (error) {
        console.error('❌ Error generando reporte semanal:', error);
        res.status(500).json({ msg: 'Error generando el reporte' });
    }
};

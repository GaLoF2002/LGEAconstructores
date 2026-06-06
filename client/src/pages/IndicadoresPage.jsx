import React, { useEffect, useState } from "react";
import { getIndicadores, getIndicadoresPorPropiedad } from "../services/indicadoresService";
import { TbChevronLeft, TbChevronRight, TbReportAnalytics } from "react-icons/tb";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    Legend,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";
import "./IndicadoresPage.css";

const IndicadoresPage = () => {
    const [datos, setDatos] = useState(null);
    const [indicadoresPropiedad, setIndicadoresPropiedad] = useState(null);
    const [propiedadActiva, setPropiedadActiva] = useState(null);
    const [pagina, setPagina] = useState(1);

    const propiedadesPorPagina = 3; // Número de propiedades a mostrar por página

    const COLORS = [
        '#c9a961', '#2a2826', '#8c867d', '#a8884a',
        '#3a3937', '#cfcac3', '#6f6b66', '#161514'
    ];

    useEffect(() => {
        const fetchIndicadores = async () => {
            try {
                const res = await getIndicadores();
                console.log("Datos generales recibidos:", res.data); // DEBUG: Verifica los datos iniciales
                setDatos(res.data);
                setPagina(1); // Reiniciar a la página 1 cuando se cargan nuevos datos
            } catch (err) {
                console.error("Error al cargar indicadores generales: ", err);
                // Aquí podrías establecer un estado de error para mostrarlo en la UI
            }
        };
        fetchIndicadores();
    }, []); // Se ejecuta solo una vez al montar el componente

    const manejarVerReporte = async (propiedadId, titulo) => {
        if (!propiedadId) {
            console.error("ID de propiedad no válido para 'manejarVerReporte'");
            return;
        }
        try {
            const res = await getIndicadoresPorPropiedad(propiedadId);
            console.log(`Datos de propiedad ${propiedadId} recibidos:`, res.data); // DEBUG
            setIndicadoresPropiedad(res.data);
            setPropiedadActiva(titulo);
        } catch (err) {
            console.error(`Error al cargar indicadores para la propiedad ${propiedadId}: `, err);
        }
    };

    // Muestra "Cargando..." si los datos aún no están disponibles
    if (!datos) {
        return (
            <div className="indicadores-container">
                <p style={{ textAlign: 'center', fontSize: '1.2rem', padding: '3rem 0' }}>
                    Cargando indicadores...
                </p>
            </div>
        );
    }

    // --- Preparación de datos para los gráficos y listas ---
    const propiedadesMasVistas = Array.isArray(datos.propiedadesMasVistas) ? datos.propiedadesMasVistas : [];
    const tiposMasVistosData = Array.isArray(datos.tiposMasVistos) ? datos.tiposMasVistos : [];
    const filtrosUsadosData = Array.isArray(datos.filtrosUsados) ? datos.filtrosUsados : [];

    // Lógica de paginación
    console.log("Total de propiedades para paginar:", propiedadesMasVistas.length); // DEBUG
    console.log("Propiedades por página (constante):", propiedadesPorPagina); // DEBUG

    const totalPaginas = Math.ceil(propiedadesMasVistas.length / propiedadesPorPagina);
    console.log("Total de páginas calculado:", totalPaginas); // DEBUG

    const propiedadesPaginadas = propiedadesMasVistas.slice(
        (pagina - 1) * propiedadesPorPagina,
        pagina * propiedadesPorPagina
    );

    // Datos para el gráfico de barras
    const barChartData = propiedadesMasVistas.map(p => ({
        titulo: p.propiedad?.titulo || `ID: ${p.propiedad?._id}` || "Propiedad Desconocida",
        total: p.total || 0
    }));

    return (
        <div className="indicadores-container">
            <header className="indicadores-header">
                <span className="indicadores-eyebrow">Reportes · Mes actual</span>
                <h2 className="titulo-principal">Indicadores de gestión</h2>
            </header>

            {/* Sección: Tipos de Propiedades Más Vistas */}
            <div className="seccion">
                <h3 className="titulo-seccion">Tipos de Propiedades Más Vistas</h3>
                {tiposMasVistosData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                            <Pie
                                data={tiposMasVistosData}
                                dataKey="total"
                                nameKey="_id" // Asume que '_id' es el nombre del tipo (e.g., "casa", "departamento")
                                cx="50%"
                                cy="50%"
                                outerRadius={110}
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                                {tiposMasVistosData.map((entry, index) => (
                                    <Cell key={`cell-pie-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Legend wrapperStyle={{ paddingTop: "20px" }} />
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <p>No hay datos disponibles para tipos de propiedades más vistas.</p>
                )}
            </div>

            {/* Sección: Ranking de Propiedades Más Vistas */}
            <div className="seccion">
                <h3 className="titulo-seccion">Ranking de Propiedades Más Vistas</h3>
                {barChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={450}> {/* Altura aumentada */}
                        <BarChart
                            data={barChartData}
                            margin={{ top: 30, right: 30, left: 5, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="titulo" hide />
                            <YAxis allowDecimals={false} domain={[0, 'dataMax + 2']} /> {/* Dominio ajustado */}
                            <Tooltip
                                formatter={(value, name, props) => [`Total Visitas: ${value}`, `Propiedad: ${props.payload.titulo}`]}
                                wrapperStyle={{zIndex: 1000}} // Asegurar que el tooltip esté por encima
                            />
                            <Bar dataKey="total" fill={COLORS[0]} radius={[5, 5, 0, 0]} barSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p>No hay datos disponibles para el ranking de propiedades.</p>
                )}
            </div>

            {/* Sección: Lista de Propiedades Más Vistas con Paginación */}
            <div className="seccion">
                <h3 className="titulo-seccion">Lista de propiedades más vistas</h3>
                {propiedadesPaginadas.length > 0 ? (
                    <ul className="lista-propiedades">
                        {propiedadesPaginadas.map((p, i) => (
                            <li key={p.propiedad?._id || `prop-${pagina}-${i}`} className="tarjeta-propiedad">
                                <h4 className="titulo-propiedad">{p.propiedad?.titulo || "Propiedad Desconocida"}</h4>
                                <div className="contenedor-imagen">
                                    {p.propiedad?.imagenes?.[0] ? (
                                        <img
                                            src={p.propiedad.imagenes[0]}
                                            alt={`Imagen de ${p.propiedad?.titulo || "propiedad"}`}
                                            className="imagen-propiedad"
                                        />
                                    ) : (
                                        <div className="imagen-placeholder">Sin imagen</div>
                                    )}
                                </div>
                                <p><strong>Tipo:</strong> {p.propiedad?.tipo || "N/A"}</p>
                                <p><strong>Ubicación:</strong> {p.propiedad?.ubicacion || "N/A"}</p>
                                <p><strong>Habitaciones:</strong> {p.propiedad?.habitaciones ?? "N/A"}</p>
                                <p><strong>Parqueaderos:</strong> {p.propiedad?.parqueaderos ?? "N/A"}</p>
                                <p><strong>Visitas:</strong> {p.total || 0}</p>
                                {p.propiedad?._id && ( // Solo mostrar botón si hay ID
                                    <button onClick={() => manejarVerReporte(p.propiedad._id, p.propiedad.titulo)}>
                                        <TbReportAnalytics aria-hidden="true" /> Ver reporte
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    propiedadesMasVistas.length > 0 ?
                        <p>No hay más propiedades para mostrar en esta página.</p> :
                        <p>No hay propiedades para mostrar en esta sección.</p>
                )}

                {/* Controles de Paginación */}
                {totalPaginas > 1 && (
                    <div className="paginacion">
                        <button
                            className="boton-pagina"
                            onClick={() => setPagina((prev) => Math.max(prev - 1, 1))}
                            disabled={pagina === 1}
                        >
                            <TbChevronLeft aria-hidden="true" /> Anterior
                        </button>
                        <span className="numero-pagina">Página {pagina} de {totalPaginas}</span>
                        <button
                            className="boton-pagina"
                            onClick={() => setPagina((prev) => Math.min(prev + 1, totalPaginas))}
                            disabled={pagina === totalPaginas}
                        >
                            Siguiente <TbChevronRight aria-hidden="true" />
                        </button>
                    </div>
                )}
                {/* Mensaje de depuración si solo hay una página o ninguna */}
                {propiedadesMasVistas.length > 0 && totalPaginas <= 1 && (
                    <p className="info-paginacion">
                        (Total de propiedades: {propiedadesMasVistas.length}. Todas se muestran en una página.)
                    </p>
                )}
            </div>

            {/* Sección: Reporte de Indicadores para Propiedad Activa */}
            {indicadoresPropiedad && propiedadActiva && (
                <div className="seccion reporte-detalle">
                    <h3 className="titulo-seccion">Reporte detallado: {propiedadActiva}</h3>
                    <p>
                        <strong>Tiempo promedio de visualización:</strong>{" "}
                        {Number.isFinite(indicadoresPropiedad.tiempoPromedio)
                            ? `${Math.round(indicadoresPropiedad.tiempoPromedio)} segundos`
                            : "N/A"}
                    </p>

                    <h4>Clientes que más la visitaron</h4>
                    {indicadoresPropiedad.clientesFrecuentes && indicadoresPropiedad.clientesFrecuentes.length > 0 ? (
                        <ul className="grid-ul">
                            {indicadoresPropiedad.clientesFrecuentes.map((c, i) => (
                                <li key={c.cliente?._id || `cliente-${i}`}>{c.cliente?.name || "Cliente Desconocido"} – {c.totalVisitas} visita(s)</li>
                            ))}
                        </ul>
                    ) : <p>No hay datos de clientes frecuentes para esta propiedad.</p>}

                    <h4>Visitas por mes</h4>
                    {indicadoresPropiedad.visitasMensuales && indicadoresPropiedad.visitasMensuales.length > 0 ? (
                        <ul className="grid-ul">
                            {indicadoresPropiedad.visitasMensuales.map((v, i) => (
                                <li key={`${v._id?.mes}-${v._id?.anio}` || `visitaMes-${i}`}>{v._id?.mes || "Mes ?"}/{v._id?.anio || "Año ?"}: {v.total} visita(s)</li>
                            ))}
                        </ul>
                    ) : <p>No hay datos de visitas mensuales para esta propiedad.</p>}
                </div>
            )}

            {/* Sección: Consultas por Filtros Más Comunes */}
            <div className="seccion">
                <h3 className="titulo-seccion">Consultas por filtros más comunes</h3>
                {filtrosUsadosData.length > 0 ? (
                    <table className="tabla-filtros">
                        <thead>
                        <tr>
                            <th>Habitaciones</th>
                            <th>Parqueaderos</th>
                            <th>Consultas</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtrosUsadosData.map((f, i) => (
                            <tr key={`${f._id?.habitaciones}-${f._id?.parqueaderos}` || `filtro-${i}`}>
                                <td>{f._id?.habitaciones ?? "N/A"}</td>
                                <td>{f._id?.parqueaderos ?? "N/A"}</td>
                                <td>{f.total ?? "N/A"}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No hay datos disponibles sobre filtros comunes.</p>
                )}
            </div>
        </div>
    );
};

export default IndicadoresPage;
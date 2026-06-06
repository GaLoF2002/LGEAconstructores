import React, { useState } from "react";
import { crearEvaluacion } from "../services/evaluacionService";
import "./FormularioEvaluacion.css";

const FormularioEvaluacion = ({ propiedadId, onFinalizar }) => {
    const [paso, setPaso] = useState(1);
    const [tipoCompra, setTipoCompra] = useState("");
    const [tiempoCompra, setTiempoCompra] = useState("");
    const [ingresos, setIngresos] = useState({ sueldo: 0, otros: 0, conyuge: 0 });
    const [egresos, setEgresos] = useState({ deudas: 0 });
    const [buro, setBuro] = useState("");
    const [antiguedadAnios, setAntiguedadAnios] = useState(0);
    const [tieneEntrada30, setTieneEntrada30] = useState(false);
    const [tieneInmueble, setTieneInmueble] = useState(false);
    const [valorTotalInmuebles, setValorTotalInmuebles] = useState(0);
    const [plazoCreditoAnios, setPlazoCreditoAnios] = useState(20);
    const [documentos, setDocumentos] = useState([]);
    const [mensaje, setMensaje] = useState("");

    const handleSubmit = async () => {
        if (tipoCompra === "credito" && !buro) {
            setMensaje("⚠️ Debes seleccionar tu buró crediticio.");
            return;
        }

        const formData = new FormData();
        const datos = {
            tipoCompra,
            tiempoCompra,
            ingresos,
            egresos,
            buro,
            antiguedadAnios,
            tieneEntrada30,
            tieneInmueble,
            valorTotalInmuebles,
            plazoCreditoAnios,
            propiedadInteres: propiedadId
        };

        formData.append("datos", JSON.stringify(datos));
        documentos.forEach(doc => formData.append("documentos", doc));

        try {
            await crearEvaluacion(formData);
            setMensaje("✅ ¡Gracias! Nos pondremos en contacto contigo muy pronto.");
            setTimeout(() => {
                if (onFinalizar) onFinalizar();
            }, 2500);
        } catch (error) {
            setMensaje("❌ Error al enviar la evaluación. Inténtalo más tarde.");
        }
    };

    return (
        <div className="form-evaluacion-container">
            <h2>Evaluación de Compra</h2>

            {paso === 1 && (
                <div className="paso">
                    <p className="pregunta">¿Cómo deseas comprar la propiedad?</p>
                    <div className="opciones-compra">
                        <button className="boton-opcion" onClick={() => { setTipoCompra("contado"); setPaso(2); }}>De contado</button>
                        <button className="boton-opcion credito" onClick={() => { setTipoCompra("credito"); setPaso(2); }}>Con crédito</button>
                    </div>
                </div>
            )}

            {paso === 2 && (
                <div className="paso">
                    <p className="pregunta">¿En cuánto tiempo deseas comprar?</p>
                    <select className="selector-tiempo" value={tiempoCompra} onChange={e => setTiempoCompra(e.target.value)}>
                        <option value="">Selecciona</option>
                        <option value="1mes">En 1 mes</option>
                        <option value="2meses">En 2 meses</option>
                        <option value="3meses">En 3 meses</option>
                    </select>
                    <button
                        className="boton-siguiente"
                        disabled={!tiempoCompra}
                        onClick={() => tipoCompra === "credito" ? setPaso(3) : handleSubmit()}
                    >
                        Siguiente
                    </button>
                </div>
            )}

            {paso === 3 && (
                <div className="paso">
                    <h4 className="subtitulo">Información Financiera</h4>

                    <div className="campo">
                        <label className="etiqueta">Ingreso mensual:</label>
                        <input type="number" className="input-field" min={0} value={ingresos.sueldo} onChange={e => setIngresos({ ...ingresos, sueldo: Number(e.target.value) })} />
                    </div>

                    <div className="campo">
                        <label className="etiqueta">Otros ingresos:</label>
                        <input type="number" className="input-field" min={0} value={ingresos.otros} onChange={e => setIngresos({ ...ingresos, otros: Number(e.target.value) })} />
                    </div>

                    <div className="campo">
                        <label className="etiqueta">Ingreso del cónyuge:</label>
                        <input type="number" className="input-field" min={0} value={ingresos.conyuge} onChange={e => setIngresos({ ...ingresos, conyuge: Number(e.target.value) })} />
                    </div>

                    <div className="campo">
                        <label className="etiqueta">Egresos totales (incluyendo deudas):</label>
                        <input type="number" className="input-field" min={0} value={egresos.deudas} onChange={e => setEgresos({ ...egresos, deudas: Number(e.target.value) })} />
                    </div>

                    <div className="campo">
                        <label className="etiqueta">¿Tienes el 30% del valor de la propiedad?</label>
                        <select className="selector-entrada" value={tieneEntrada30} onChange={e => setTieneEntrada30(e.target.value === "true")}>
                            <option value="false">No</option>
                            <option value="true">Sí</option>
                        </select>
                    </div>

                    <div className="campo">
                        <label className="etiqueta">Buró crediticio:</label>
                        <select className="selector-buro" value={buro} onChange={e => setBuro(e.target.value)}>
                            <option value="">Selecciona</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                            <option value="E">E</option>
                        </select>
                    </div>

                    <div className="campo">
                        <label className="etiqueta">Antigüedad laboral (años):</label>
                        <input type="number" className="input-field" min={0} value={antiguedadAnios} onChange={e => setAntiguedadAnios(Number(e.target.value))} />
                    </div>

                    <div className="campo">
                        <label className="etiqueta">¿Tienes algún inmueble a tu nombre?</label>
                        <select className="selector-inmueble" value={tieneInmueble} onChange={e => setTieneInmueble(e.target.value === "true")}>
                            <option value="false">No</option>
                            <option value="true">Sí</option>
                        </select>
                    </div>

                    <div className="campo">
                        <label className="etiqueta">Valor total de tus inmuebles:</label>
                        <input type="number" className="input-field" min={0} value={valorTotalInmuebles} onChange={e => setValorTotalInmuebles(Number(e.target.value))} />
                    </div>

                    <div className="campo">
                        <label className="etiqueta">¿A cuántos años deseas financiar?</label>
                        <input type="number" className="input-field" min={1} value={plazoCreditoAnios} onChange={e => setPlazoCreditoAnios(Number(e.target.value))} />
                    </div>

                    <div className="campo archivo">
                        <label className="etiqueta">Adjunta documentos (Aprobaciones préstamos bancarios, etc. en formato PDF)</label>
                        <input type="file" className="input-archivo" multiple accept="application/pdf" onChange={e => setDocumentos([...e.target.files])} />
                    </div>

                    <button className="boton-enviar" onClick={handleSubmit}>Enviar Evaluación</button>
                </div>
            )}

            {mensaje && <p className={mensaje.includes("✅") ? "mensaje-exito" : "mensaje-error"}>{mensaje}</p>}
        </div>
    );
};

export default FormularioEvaluacion;

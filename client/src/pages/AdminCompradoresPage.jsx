import React, { useEffect, useState, useContext } from "react";
import { getPropiedades } from "../services/propiedadService";
import { getEvaluacionesPorPropiedad } from "../services/evaluacionService";
import { AuthContext } from "../context/AuthContext";

import "./AdminCompradoresPage.css";

const AdminCompradoresPage = ({ setActiveSection, setPropiedadSeleccionada, setEvaluacionSeleccionadaId }) => {

    const { user } = useContext(AuthContext);
    const [propiedades, setPropiedades] = useState([]);
    const [compradoresVisibles, setCompradoresVisibles] = useState({});
    const [evaluacionesPorPropiedad, setEvaluacionesPorPropiedad] = useState({});


    useEffect(() => {
        const cargarPropiedades = async () => {
            try {
                const res = await getPropiedades();
                setPropiedades(res.data);
            } catch (err) {
                console.error("Error al cargar propiedades:", err);
            }
        };
        cargarPropiedades();
    }, []);

    const toggleCompradores = async (propiedadId) => {
        setCompradoresVisibles((prev) => ({
            ...prev,
            [propiedadId]: !prev[propiedadId],
        }));

        if (!evaluacionesPorPropiedad[propiedadId]) {
            try {
                const res = await getEvaluacionesPorPropiedad(propiedadId);

                console.log(`Evaluaciones para propiedad ${propiedadId}:`, res.data);

                setEvaluacionesPorPropiedad((prev) => ({
                    ...prev,
                    [propiedadId]: res.data,
                }));
            } catch (err) {
                console.error("Error al obtener compradores:", err);
            }
        }
    };

    if (!user || (user.role !== "admin" && user.role !== "vendedor")) {
        return <p>No tienes acceso a esta sección.</p>;
    }

    return (
        <div className="admin-compradores-container">
            <header className="compradores-header">
                <span className="compradores-eyebrow">Clientes</span>
                <h2>Propiedades y compradores</h2>
            </header>

            {propiedades.map((prop) => (
                <div key={prop._id} className="propiedad-card-compradores">
                    <div className="propiedad-card-compradores__head">
                        <div className="propiedad-foto">
                            {prop.imagenes?.[0] ? (
                                <img src={prop.imagenes[0]} alt={`Fachada de ${prop.titulo}`} loading="lazy" />
                            ) : (
                                <div className="propiedad-foto--placeholder">Sin imagen</div>
                            )}
                        </div>
                        <div className="propiedad-info">
                            <h3>{prop.titulo}</h3>
                            <p><strong>Ubicación</strong> {prop.ubicacion}</p>
                            <p><strong>Precio</strong> ${prop.precio.toLocaleString()}</p>
                            <button onClick={() => toggleCompradores(prop._id)}>
                                {compradoresVisibles[prop._id] ? "Ocultar compradores" : "Ver compradores"}
                            </button>
                        </div>
                    </div>

                    {compradoresVisibles[prop._id] && evaluacionesPorPropiedad[prop._id] && (
                        <div className="tabla-compradores">
                            {/* COMPRADORES CONTADO */}
                            <div className="tabla-seccion">
                                <h4>Compradores de Contado</h4>
                                <table>
                                    <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Correo</th>
                                        <th>Teléfono</th>
                                        <th>Porcentaje de Compra</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {evaluacionesPorPropiedad[prop._id].contado.map((c) => (
                                        <tr key={c._id}>
                                            <td>{c.cliente.name}</td>
                                            <td>{c.cliente.email}</td>
                                            <td>{c.cliente.phone || "No disponible"}</td>
                                            <td>{c.porcentaje?.toFixed(2)}%</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* COMPRADORES CRÉDITO */}
                            <div className="tabla-seccion">
                                <h4>Compradores con Crédito</h4>
                                <table>
                                    <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Correo</th>
                                        <th>Teléfono</th>
                                        <th>Porcentaje de Compra</th>
                                        <th>Acciones</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {evaluacionesPorPropiedad[prop._id].credito.map((c) => (
                                        <tr key={c._id}>
                                            <td>{c.cliente.name}</td>
                                            <td>{c.cliente.email}</td>
                                            <td>{c.cliente.phone || "No disponible"}</td>
                                            <td>{c.porcentaje?.toFixed(2)}%</td>
                                            <td>
                                                <button
                                                    onClick={() => {
                                                        setPropiedadSeleccionada(prop._id);
                                                        setEvaluacionSeleccionadaId(c._id);
                                                        setActiveSection("detalle-evaluacion");
                                                    }}
                                                >
                                                    Ver información
                                                </button>

                                            </td>

                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default AdminCompradoresPage;

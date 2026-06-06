import { useEffect, useState } from "react";
import { crearPropiedad, actualizarPropiedad } from "../services/propiedadService";
import { useToast } from "../context/ToastContext";
import "./CrearPropiedad.css";

const CrearPropiedad = ({ setActiveSection, modoEdicion = false, propiedadEditando = null }) => {
    const toast = useToast();
    const [form, setForm] = useState({
        titulo: "",
        descripcion: "",
        precio: 0,
        ubicacion: "",
        metrosCuadrados: 0,
        parqueaderos: 0,
        habitaciones: 0,
        banos: 0,
        tipo: "casa",
        estado: "disponible",
        imagenes: [],
        caracteristicas: []
    });

    const [imagePreviews, setImagePreviews] = useState([]);

    useEffect(() => {
        if (modoEdicion && propiedadEditando) {
            const {
                titulo, descripcion, precio, ubicacion, metrosCuadrados,
                parqueaderos, habitaciones, banos, tipo, estado, caracteristicas
            } = propiedadEditando;

            setForm({
                titulo,
                descripcion,
                precio,
                ubicacion,
                metrosCuadrados,
                parqueaderos,
                habitaciones,
                banos,
                tipo,
                estado,
                imagenes: [],
                caracteristicas: caracteristicas || []
            });
        }
    }, [modoEdicion, propiedadEditando]);

    useEffect(() => {
        return () => {
            imagePreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imagePreviews]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleCaracteristicas = (e) => {
        const value = e.target.value.split(",");
        setForm({ ...form, caracteristicas: value });
    };

    const handleImageChange = (e) => {
        const newFiles = Array.from(e.target.files);

        if (form.imagenes.length + newFiles.length > 10) {
            toast.error("Solo puedes subir un máximo de 10 imágenes.");
            return;
        }

        const updatedFiles = [...form.imagenes, ...newFiles];
        const updatedPreviews = [...imagePreviews, ...newFiles.map(file => URL.createObjectURL(file))];

        setForm({ ...form, imagenes: updatedFiles });
        setImagePreviews(updatedPreviews);
    };

    const handleRemoveImage = (index) => {
        const nuevasImagenes = form.imagenes.filter((_, i) => i !== index);
        const nuevasPreviews = imagePreviews.filter((_, i) => i !== index);
        setForm({ ...form, imagenes: nuevasImagenes });
        setImagePreviews(nuevasPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();

            for (let key in form) {
                if (key === "imagenes") {
                    form.imagenes.forEach((file) => {
                        formData.append("imagenes", file);
                    });
                } else if (Array.isArray(form[key])) {
                    form[key].forEach((item) => formData.append(key, item));
                } else {
                    formData.append(key, form[key]);
                }
            }

            if (modoEdicion && propiedadEditando) {
                await actualizarPropiedad(propiedadEditando._id, form);
                toast.success("Propiedad actualizada correctamente");
            } else {
                await crearPropiedad(formData);
                toast.success("Propiedad creada correctamente");
            }

            setActiveSection("propiedades");
        } catch (error) {
            console.error("Error al guardar propiedad", error);
            const msg = error.response?.data?.msg
                || error.response?.data?.error
                || "No se pudo guardar la propiedad. Intenta de nuevo.";
            toast.error(msg);
        }
    };

    return (
        <div className="crear-propiedad-container">
            <div className="crear-propiedad-form-container">
                <h2>{modoEdicion ? "Actualizar Propiedad" : "Crear Nueva Propiedad"}</h2>
                <form className="crear-propiedad-form" onSubmit={handleSubmit}>
                    <div className="form-column">
                        <label>Título</label>
                        <input name="titulo" className="input-box" value={form.titulo} onChange={handleChange} required />

                        <label>Precio</label>
                        <input name="precio" type="number" className="input-box" value={form.precio} onChange={handleChange} required />

                        <label>Ubicación</label>
                        <input name="ubicacion" className="input-box" value={form.ubicacion} onChange={handleChange} required />

                        <label>Metros cuadrados</label>
                        <input name="metrosCuadrados" type="number" className="input-box" value={form.metrosCuadrados} onChange={handleChange} required />
                    </div>

                    <div className="form-column">
                        <label>Parqueaderos</label>
                        <input name="parqueaderos" type="number" className="input-box" value={form.parqueaderos} onChange={handleChange} required />

                        <label>Habitaciones</label>
                        <input name="habitaciones" type="number" className="input-box" value={form.habitaciones} onChange={handleChange} required />

                        <label>Baños</label>
                        <input name="banos" type="number" className="input-box" value={form.banos} onChange={handleChange} required />

                        <label>Tipo</label>
                        <select name="tipo" className="input-box" value={form.tipo} onChange={handleChange} required>
                            <option value="casa">Casa</option>
                            <option value="departamento">Departamento</option>
                            <option value="terreno">Terreno</option>
                        </select>
                    </div>

                    <div className="form-full">
                        <label>Estado</label>
                        <select name="estado" className="input-box" value={form.estado} onChange={handleChange}>
                            <option value="disponible">Disponible</option>
                            <option value="reservado">Reservado</option>
                            <option value="vendido">Vendido</option>
                        </select>

                        <label>Características</label>
                        <input name="caracteristicas" className="input-long" onChange={handleCaracteristicas} value={form.caracteristicas.join(",")} />

                        <label>Descripción</label>
                        <textarea name="descripcion" className="input-long" value={form.descripcion} onChange={handleChange} />

                        <div className="file-upload-container">
                            <label className="file-label">Imágenes (máx. 10)</label>
                            <input
                                className="choose-files"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            <div className="preview-container">
                                {imagePreviews.map((src, index) => (
                                    <div key={index} className="preview-wrapper">
                                        <img src={src} alt={`Preview ${index}`} className="preview-image" />
                                        <button type="button" className="remove-image-button" onClick={() => handleRemoveImage(index)}>
                                            ✖
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="button-group">
                        <button type="submit">{modoEdicion ? "Actualizar" : "Guardar"}</button>
                        <button type="button" onClick={() => setActiveSection("propiedades")}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrearPropiedad;

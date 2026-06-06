import User from "../models/User.js";
import bcrypt from "bcryptjs";


export const obtenerPerfil = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (error) {
        console.error("Error al obtener el perfil:", error);
        res.status(500).json({ error: "Error al obtener el perfil" });
    }
};

// Actualizar perfil del usuario
export const actualizarPerfil = async (req, res) => {
    try {
        const { name, email, phone, password, currentPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const cambiaEmail = email && email !== user.email;
        const cambiaPassword = !!password;

        // Cambios sensibles (email o contraseña) exigen confirmar la contraseña actual.
        if (cambiaEmail || cambiaPassword) {
            if (!currentPassword) {
                return res.status(400).json({ error: "Debes ingresar tu contraseña actual para cambiar el email o la contraseña" });
            }
            const ok = await bcrypt.compare(currentPassword, user.password);
            if (!ok) {
                return res.status(400).json({ error: "La contraseña actual es incorrecta" });
            }
        }

        // Email único.
        if (cambiaEmail) {
            const existe = await User.findOne({ email });
            if (existe) {
                return res.status(400).json({ error: "Ese email ya está en uso" });
            }
            user.email = email;
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (cambiaPassword) {
            user.password = await bcrypt.hash(password, 12);
            // Invalida los JWT previos (cierra otras sesiones por seguridad).
            user.tokenVersion = (user.tokenVersion ?? 0) + 1;
        }

        await user.save();
        res.json({ message: "Perfil actualizado correctamente", passwordChanged: cambiaPassword });

    } catch (error) {
        console.error("Error al actualizar el perfil:", error);
        res.status(500).json({ error: "Error al actualizar el perfil" });
    }
};

// Bootstrap del primer admin. Ejecutar UNA sola vez por entorno:
//   ADMIN_EMAIL=tu@correo.com ADMIN_PASSWORD='LargaYDificil!' ADMIN_NAME='Admin' ADMIN_PHONE='0999999999' node scripts/bootstrapAdmin.js
//
// Requiere MONGO_URI en el .env. Si ya existe un admin con ese email, no hace nada.

import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

dotenv.config();

const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, ADMIN_PHONE, MONGO_URI } = process.env;

function fail(msg) {
    console.error(`✗ ${msg}`);
    process.exit(1);
}

if (!MONGO_URI) fail("Falta MONGO_URI en el entorno.");
if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_NAME || !ADMIN_PHONE) {
    fail("Faltan variables ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME y/o ADMIN_PHONE.");
}
if (ADMIN_PASSWORD.length < 12) {
    fail("ADMIN_PASSWORD debe tener al menos 12 caracteres.");
}

try {
    await mongoose.connect(MONGO_URI);

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
        console.log(`✓ Ya existe un usuario con email ${ADMIN_EMAIL} (role=${existing.role}). No se hace nada.`);
        await mongoose.disconnect();
        process.exit(0);
    }

    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashed,
        phone: ADMIN_PHONE,
        role: "admin"
    });

    console.log(`✓ Admin creado: ${ADMIN_EMAIL}`);
    await mongoose.disconnect();
    process.exit(0);
} catch (err) {
    console.error("✗ Error creando admin:", err.message);
    process.exit(1);
}

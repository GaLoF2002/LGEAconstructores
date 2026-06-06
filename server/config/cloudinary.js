import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

// Si usas CLOUDINARY_URL, esta config es opcional; igual la dejo explícita:
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD,
    api_key:    process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

export default cloudinary;
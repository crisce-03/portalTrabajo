import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import AppError from '../Utils/AppError.js';

// Fuera de public/: los CV no se sirven como archivos estáticos.
const CARPETA = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../uploads/cv');
mkdirSync(CARPETA, { recursive: true });

const TIPOS = {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

const upload = multer({
    storage: multer.diskStorage({
        destination: CARPETA,
        filename: (req, file, cb) => cb(null, `${req.usuario.id}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`),
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const valido = TIPOS[path.extname(file.originalname).toLowerCase()] === file.mimetype;
        cb(valido ? null : AppError.badRequest('El CV debe ser un archivo PDF o DOCX'), valido);
    },
}).single('cv');

// Sube el CV opcional del campo "cv" y deja el archivo en req.file.
export default function uploadCv(req, res, next) {
    upload(req, res, err => {
        if (err instanceof multer.MulterError) {
            return next(AppError.badRequest(err.code === 'LIMIT_FILE_SIZE' ? 'El CV supera 5 MB' : 'No se pudo recibir el archivo'));
        }
        next(err);
    });
}

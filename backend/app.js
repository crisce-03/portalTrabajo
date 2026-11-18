import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import routes from './Routes/index.js';
import notFound from './Middlewares/NotFound.js';
import errorHandler from './Middlewares/ErrorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Cabeceras de seguridad HTTP. La CSP se desactiva porque aplica a páginas HTML y el frontend
// carga Bootstrap, iconos y fuentes desde CDNs; la CSP por defecto de helmet los bloquearía.
app.use(helmet({ contentSecurityPolicy: false }));

app.use(cors());
app.use(morgan('dev')); // log de cada petición
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;

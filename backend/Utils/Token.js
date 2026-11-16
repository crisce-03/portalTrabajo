import jtw from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('Falta JWT_SECRET en la configuración del entorno');
}

const signToken = usuario => {
    return jtw.sign({id: usuario.id, rol: usuario.rol}, JWT_SECRET, { expiresIn: "1h" });
}

const verifyToken = token => {
    return jtw.verify(token, JWT_SECRET);
}

export { signToken, verifyToken };

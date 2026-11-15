import jtw from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const signToken = usuario => {
    return jtw.sign({id: usuario.id, rol: usuario.rol}, JWT_SECRET, { expiresIn: "1h" });
}

const verifyToken = token => {
    return jtw.verify(token, JWT_SECRET);
}

export { signToken, verifyToken };
import bcrypt from 'bcryptjs';
import * as usuariosRepository from '../Repositories/UsuariosRepository.js';
import * as empresasRepository from '../Repositories/EmpresasRepository.js';
import { ROLES } from '../Constants/roles.js';
import * as candidatosRepository from '../Repositories/CandidatosRepository.js';
import { signToken } from '../Utils/Token.js';
import AppError from '../Utils/AppError.js';

const registrar = async datos => {
    const existente = await usuariosRepository.buscarPorCorreo(datos.correo);

    if (existente) {
        throw AppError.conflict('Ya existe una cuenta con ese correo');
    }

    if (datos.tipo === ROLES.EMPRESA && await empresasRepository.buscarPorNombre(datos.empresa)) {
        throw AppError.conflict('Ya existe una empresa con ese nombre');
    }

    const claveHash = await bcrypt.hash(datos.clave, 10);

    const usuario = await usuariosRepository.crear({ ...datos, claveHash, rol: datos.tipo });

    if (datos.tipo === ROLES.EMPRESA) {
        await empresasRepository.crear({
            usuarioId: usuario.id,
            nombre: datos.empresa,
            sector: datos.sector,
            correoContacto: datos.correo,
        });
    } else {
        await candidatosRepository.crearPerfil(usuario.id);
    }

    return { token: signToken(usuario), usuario };
};

const iniciarSesion = async ({ correo, clave }) => {
    const usuario = await usuariosRepository.buscarPorCorreo(correo);
    const claveCorrecta = usuario && await bcrypt.compare(clave, usuario.clave_hash);

    if (!claveCorrecta) {
        throw AppError.unauthorized('Correo o contraseña incorrectos');
    }

    if (!usuario.activo) {
        throw AppError.forbidden('Tu cuenta está deshabilitada');
    }

    const { clave_hash, ...datosPublicos } = usuario;

    return { token: signToken(usuario), usuario: datosPublicos };
};

export { registrar, iniciarSesion };

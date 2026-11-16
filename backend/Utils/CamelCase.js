
const convertirClave = (clave) => clave.replace(/_([a-z])/g, (_, letra) => letra.toUpperCase());

export const aCamelCase = (datos) => {
    if (Array.isArray(datos)) return datos.map((fila) => aCamelCase(fila));
    if (!datos) return datos;

    return Object.fromEntries(
        Object.entries(datos).map(([clave, valor]) => [convertirClave(clave), valor])
    );
};
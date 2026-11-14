
export function success(res, data = null, { status = 200, message = 'OK', meta } = {}) {
    const body = { success: true, message, data };
    if (meta) body.meta = meta;
    return res.status(status).json(body);
}
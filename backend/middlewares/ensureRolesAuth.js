import { deleteSessionToken, validateSessionToken } from '../apiServices/session/session.model.js';
import { validateToken } from '../services/jwt.js';
import consts from '../utils/consts.js';
import CustomError from '../utils/customError.js';
import exists from '../utils/exists.js';

/**
 * Middleware que verifica que el token de usuario contenga al menos uno de los roles requeridos.
 * @param {Array[String]} roles: Arreglo que contiene los roles a verificar. Se puede agregar
 * un rol único o colocar null si no se desean validar roles.
 * @param {String} errorMessage: Mensaje a retornar si ninguno de los roles coincide.
 */
const ensureRolesAuth = (roles, errorMessage) => async (req, res, next) => {
  const authToken = req.headers?.authorization;
  try {
    if (!authToken) {
      throw new CustomError('No se ha especificado el token de autorización.', 401);
    }

    const userData = await validateToken(authToken);

    // Validar en la base de datos
    await validateSessionToken(userData.id, authToken);

    if (userData.type !== consts.token.access) {
      throw new CustomError('El token de autorización no es de tipo access.', 401);
    }

    // Verificar si no cuenta con al menos uno de los roles solicitados
    if (exists(roles)
        && (Array.isArray(roles) && roles.length > 0 && !roles.some((role) => userData.role?.includes(role)))
        && !userData.role?.includes(roles)) {
      throw new CustomError(errorMessage ?? 'No se cuenta con los privilegios necesarios.', 403);
    }

    req.session = userData;
    next();
  } catch (ex) {
    // Eliminar token si es posible
    if (authToken) deleteSessionToken(authToken).catch(() => {});
    res.statusMessage = ex?.message ?? 'El token de autorización no es válido o ha expirado.';
    res.sendStatus(ex?.status ?? 401);
  }
};

export default ensureRolesAuth;

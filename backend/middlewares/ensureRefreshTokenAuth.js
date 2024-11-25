import { deleteLinkedTokens, deleteSessionToken, validateSessionToken } from '../apiServices/session/session.model.js';
import { validateToken } from '../services/jwt.js';
import consts from '../utils/consts.js';

const ensureRefreshTokenAuth = async (req, res, next) => {
  const authToken = req.cookies?.refreshToken;

  if (!authToken) {
    res.statusMessage = 'El usuario no está autenticado.';
    return res.sendStatus(401);
  }

  try {
    const userData = await validateToken(authToken);

    // Validar en la base de datos
    const tokenNeedsUpdate = await validateSessionToken(userData.id, authToken);

    if (userData.type !== consts.token.refresh) {
      res.clearCookie('refreshToken');
      res.statusMessage = 'El token de autorización no es de tipo refresh.';
      return res.sendStatus(401);
    }
    req.session = userData;
    req.session.update = tokenNeedsUpdate ?? false;
    next();
  } catch (ex) {
    // Token invalido, retirarlo de la bd si existe
    res.clearCookie('refreshToken');
    if (authToken) {
      deleteSessionToken(authToken).catch(() => {});
      deleteLinkedTokens(authToken).catch(() => {});
    }
    res.statusMessage = 'El token de autorización no es válido o ha expirado.';
    res.sendStatus(401);
  }

  return null;
};

export default ensureRefreshTokenAuth;

import { deleteAlterUserToken, validateAlterUserToken } from '../apiServices/user/user.model.js';
import { validateToken } from '../services/jwt.js';
import consts from '../utils/consts.js';

const ensureRecoverAuth = async (req, res, next) => {
  const authToken = req.headers?.authorization;

  if (!authToken) {
    res.statusMessage = 'No se ha especificado el token de autorización.';
    return res.sendStatus(401);
  }

  try {
    const userData = await validateToken(authToken);

    await validateAlterUserToken({ idUser: userData.id, token: authToken });

    if (userData.type !== consts.token.recover) {
      res.statusMessage = 'El token de autorización no es de tipo recover.';
      return res.sendStatus(401);
    }

    req.session = userData;
    next();
  } catch (ex) {
    try {
      await deleteAlterUserToken({ token: authToken });
    } catch (err) {
      // pass
    }
    res.statusMessage = ex?.message ?? 'El token de autorización no es válido o ha expirado.';
    res.sendStatus(ex?.status ?? 401);
  }

  return null;
};

export default ensureRecoverAuth;

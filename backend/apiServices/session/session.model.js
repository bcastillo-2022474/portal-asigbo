import moment from 'moment';
import CustomError from '../../utils/customError.js';
import SessionSchema from '../../db/schemas/session.schema.js';
import UserSchema from '../../db/schemas/user.schema.js';
import single from './session.dto.js';
import consts from '../../utils/consts.js';
import writeLog from '../../utils/writeLog.js';
import getUTCDate from '../../utils/getUTCDate.js';

const storeSessionToken = async ({
  idUser, token, tokenType, linkedToken, session,
}) => {
  const sessionObj = new SessionSchema();

  sessionObj.idUser = idUser;
  sessionObj.token = token;
  sessionObj.tokenType = tokenType;
  sessionObj.linkedToken = linkedToken;
  sessionObj.date = getUTCDate();

  return sessionObj.save({ session });
};

const deleteSessionToken = async (token) => {
  const result = await SessionSchema.deleteOne({ token });
  if (result?.deletedCount !== 1) { throw new CustomError('No fue posible eliminar el refresh token.', 500); }
};

const deleteLinkedTokens = async (linkedToken) => SessionSchema.deleteMany({ linkedToken });

/**
 * Permite validar un session token.
 * @param {string} idUser
 * @param {string} token
 * @returns Boolean. Indica si el token requiere ser actualizado.
 */
const validateSessionToken = async (idUser, token) => {
  const result = await SessionSchema.findOne({ idUser, token });

  if (result === null) throw new CustomError('Session token inválido.', 401);
  return result.needUpdate;
};

const authenticate = async (user, passwordHash) => {
  const query = {
    email: user,
    passwordHash,
    blocked: false,
  };

  const result = await UserSchema.findOne(query);

  if (result === null) throw new CustomError('Usuario o contraseña incorrectos.', 400);
  return single(result);
};

const forceUserLogout = async (idUser, session) => SessionSchema.deleteMany({ idUser }, { session });

const deleteAccessTokens = async ({ idUser, session }) => SessionSchema.deleteMany({
  idUser,
  tokenType: consts.token.access,
}, { session });

/**
 * Este método marca los refresh tokens de un usuario, de manera que estos deben ser actualizados
 * con los datos del usuario. También, los access tokens del usuario son eliminados.
 * @param {string} idUser id del usuario.
 * @param {sessionObject} session Objeto de sesión de la transacción en la bd.
 */
const forceSessionTokenToUpdate = async ({ idUser, session }) => {
  await SessionSchema.updateMany({ idUser, tokenType: consts.token.refresh }, { needUpdate: true }, { session });
  await deleteAccessTokens({ idUser, session }); // Eliminar tokens viejos
};

/**
 * Elimina todos los session tokens de un usuario
 * @param {string} idUser id del usuario.
 * @param {sessionObject} session Objeto de sesión de la transacción en la bd.
 */
const deleteAllUserSessionTokens = async ({ idUser, session }) => SessionSchema.deleteMany({ idUser }, { session });

/**
 * Función que se encarga de eliminar todos los session tokens de más de un día de antiguedad.
 */
const deleteExpiredSessionTokens = async () => {
  try {
    const accessExpiration = moment().subtract(consts.tokenExpiration.access_hours_expiration, 'hour').toDate();
    const refreshExpiration = moment().subtract(consts.tokenExpiration.refresh_days_expiration, 'day').toDate();

    await SessionSchema.deleteMany({ date: { $lt: accessExpiration }, tokenType: consts.token.access });
    await SessionSchema.deleteMany({ date: { $lt: refreshExpiration }, tokenType: consts.token.refresh });
  } catch (ex) {
    writeLog(2, ex);
  }
};
export {
  storeSessionToken,
  deleteSessionToken,
  authenticate,
  validateSessionToken,
  deleteLinkedTokens,
  forceUserLogout,
  forceSessionTokenToUpdate,
  deleteAccessTokens,
  deleteAllUserSessionTokens,
  deleteExpiredSessionTokens,
};

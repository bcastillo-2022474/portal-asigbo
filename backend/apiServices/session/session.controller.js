import sha256 from 'js-sha256';
import moment from 'moment';
import config from 'config';
import {
  authenticate,
  deleteLinkedTokens,
  deleteSessionToken,
  storeSessionToken,
} from './session.model.js';
import { signAccessToken, signRefreshToken } from '../../services/jwt.js';
import { connection } from '../../db/connection.js';
import { getUser } from '../user/user.model.js';
import consts from '../../utils/consts.js';
import errorSender from '../../utils/errorSender.js';
import CustomError from '../../utils/customError.js';

const allowInsecureConnections = config.get('allowInsecureConnections');

const saveRefreshTokenInCookies = (res, token) => {
  res.cookie('refreshToken', token, {
    secure: !allowInsecureConnections,
    httpOnly: true,
    expires: moment().add(1, 'weeks').toDate(),
  });
};

const createRefreshToken = async ({
  id,
  code,
  name,
  lastname,
  promotion,
  career,
  sex,
  role,
  hasImage,
  session,
}) => {
  const refreshToken = await signRefreshToken({
    id,
    code,
    name,
    lastname,
    promotion,
    career,
    sex,
    role,
    hasImage,
  });

  // guardar refresh token en bd
  await storeSessionToken({
    idUser: id, token: refreshToken, tokenType: consts.token.refresh, session,
  });

  return refreshToken;
};

const createAccessToken = async ({
  id,
  code,
  name,
  lastname,
  promotion,
  career,
  sex,
  role,
  hasImage,
  refreshToken,
  session,
}) => {
  const accessToken = await signAccessToken({
    id,
    code,
    name,
    lastname,
    promotion,
    career,
    sex,
    role,
    hasImage,
  });

  // almacenar access token en bd
  await storeSessionToken({
    idUser: id,
    token: accessToken,
    tokenType: consts.token.access,
    linkedToken: refreshToken,
    session,
  });

  return accessToken;
};

const loginController = async (req, res) => {
  const { user, password } = req.body;

  const session = await connection.startSession();

  try {
    session.startTransaction();

    const passwordHash = sha256(password);
    const {
      id, code, name, lastname, promotion, career, sex, role, hasImage,
    } = await authenticate(
      user,
      passwordHash,
    );

    const refreshToken = await createRefreshToken({
      id, code, name, lastname, promotion, career, sex, role, hasImage, session,
    });

    // almacenar token en cookies
    saveRefreshTokenInCookies(res, refreshToken);

    const accessToken = await createAccessToken({
      id, code, name, lastname, promotion, career, sex, role, hasImage, refreshToken, session,
    });

    await session.commitTransaction();

    res.send({ accessToken });
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrió un error al intentar loggearse.', session,
    });
  } finally {
    session.endSession();
  }
};

const refreshAccessTokenController = async (req, res) => {
  let userData = req.session;

  let { refreshToken } = req.cookies;
  const session = await connection.startSession();

  try {
    session.startTransaction();

    // Verificar si el refresh token debe ser actualizado
    if (req.session.update) {
      // Eliminar tokens anteriores
      await deleteSessionToken(refreshToken);
      await deleteLinkedTokens(refreshToken);

      // Obtener usuario
      userData = await getUser({ idUser: userData.id, showSensitiveData: true });
      if (!userData) throw new CustomError('El usuario proporcionado no existe.', 404);

      const {
        id, code, name, lastname, promotion, career, sex, role, hasImage,
      } = userData;

      refreshToken = await createRefreshToken({
        id,
        code,
        name,
        lastname,
        promotion,
        career,
        sex,
        role,
        hasImage,
        session,
      });

      saveRefreshTokenInCookies(res, refreshToken);
    }

    const {
      id, code, name, lastname, promotion, career, sex, role, hasImage,
    } = userData;

    const accessToken = await createAccessToken({
      id, code, name, lastname, promotion, career, sex, role, hasImage, refreshToken, session,
    });

    await session.commitTransaction();

    res.send({ accessToken });
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al refrescar access token.', session,
    });
  } finally {
    session.endSession();
  }
};

const logoutController = async (req, res) => {
  const { refreshToken } = req.cookies;

  try {
    // Eliminar token de bd y cookie
    res.clearCookie('refreshToken');
    await deleteSessionToken(refreshToken);

    // eliminar access tokens vinculados
    await deleteLinkedTokens(refreshToken);

    res.sendStatus(200);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al cerrar sesión.',
    });
  }
};

export { loginController, refreshAccessTokenController, logoutController };

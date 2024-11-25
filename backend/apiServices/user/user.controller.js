import sha256 from 'js-sha256';
import fs from 'node:fs';
import mongoose from 'mongoose';
import CustomError from '../../utils/customError.js';
import { multiple, single } from './user.dto.js';
import {
  addRoleToUser,
  createUser,
  deleteAllUserAlterTokens,
  getUsersList,
  getUser,
  removeRoleFromUser,
  saveAlterToken,
  updateUserPassword,
  validateAlterUserToken,
  updateUserBlockedStatus,
  deleteUser,
  updateUser,
  uploadUsers,
  getUserByMail,
  getUnregisteredUsers,
  saveManyRegisterToken,
  deleteAllAlterTokensFromManyUsers,
  getUsersByPromotion,
} from './user.model.js';
import { connection } from '../../db/connection.js';
import { signRecoverPasswordToken, signRegisterToken } from '../../services/jwt.js';
import NewUserEmail from '../../services/email/NewUserEmail.js';
import consts from '../../utils/consts.js';
import uploadFileToBucket from '../../services/cloudStorage/uploadFileToBucket.js';
import Promotion from '../promotion/promotion.model.js';
import { deleteAllUserSessionTokens, forceSessionTokenToUpdate, forceUserLogout } from '../session/session.model.js';
import { getAreas, getAreasWhereUserIsResponsible } from '../asigboArea/asigboArea.model.js';
import {
  getActivitiesWhereUserIsResponsible,
} from '../activity/activity.model.js';
import deleteFileInBucket from '../../services/cloudStorage/deleteFileInBucket.js';
import parseBoolean from '../../utils/parseBoolean.js';
import RecoverPasswordEmail from '../../services/email/RecoverPasswordEmail.js';
import exists from '../../utils/exists.js';
import errorSender from '../../utils/errorSender.js';
import { verifyIfUserIsAssignedToAnyActivity } from '../activityAssignment/activityAssignment.model.js';
import { hasPaymentsAsTreasurer, verifyIfUserHasPaymentAssignments } from '../payment/payment.model.js';
import jsonToExcel from '../../services/reportMaker/jsonToExcel.js';
import writeLog from '../../utils/writeLog.js';
import getUTCDate from '../../utils/getUTCDate.js';

const saveUserProfilePicture = async ({ file, idUser }) => {
  const filePath = `${global.dirname}/files/${file.fileName}`;

  // subir archivos

  const fileKey = `${consts.bucketRoutes.user}/${idUser}`;

  try {
    await uploadFileToBucket(fileKey, filePath, file.type);
  } catch (ex) {
    throw new CustomError('No se pudo cargar la foto de perfil del usuario.', 500);
  }
};

/**
 * Envía un correo para un solo usuario
 * @param emailSender Clase NewUserEmail (Por default se crea un nuevo objeto)
 * @returns Register token generado y enviado
 */
const sendSingleUserRegisterEmail = async ({
  userId, name, lastname, email, sex, emailSender = new NewUserEmail(), session,
}) => {
  const token = signRegisterToken({
    id: userId,
    name,
    lastname,
    email,
    sex,
  });

  await saveAlterToken({
    idUser: userId, token, type: consts.token.register, session,
  });

  // enviar email de notificación
  await emailSender.sendEmail({
    addresseeEmail: email,
    name,
    registerToken: token,
  });

  return token;
};

/**
 * Envía un correo para muchos usuarios
 * @param users Array de objetos con forma {id, name, lastname, email, sex}
 * @returns Register token generado y enviado
 */
const sendManyUserRegisterEmail = async ({
  users, session,
}) => {
  // Generar arreglo de {idUser, email, name, token}
  const usersWithToken = users.map((user) => {
    const token = signRegisterToken({
      id: user.id,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      sex: user.sex,
    });

    return {
      idUser: user.id,
      email: user.email,
      name: user.name,
      token,
      tokenType: consts.token.register,
      date: getUTCDate(),
    };
  });

  await saveManyRegisterToken({ data: usersWithToken, session }); // Guardar tokens de forma masiva

  // enviar emails de notificación
  const emailSender = new NewUserEmail();

  const promiseRes = await Promise.allSettled(
    usersWithToken.map(async (user) => {
      await emailSender.sendEmail({
        addresseeEmail: user.email,
        name: user.name,
        registerToken: user.token,
      });
      return user.idUser;
    }),
  );

  // Filtrar usuarios de emails que no se hayan enviado
  const usersRejected = promiseRes.filter((val) => val?.status !== 'fulfilled');

  // Eliminar masivamente token de usuarios rechazados async (Error insignificante)
  deleteAllAlterTokensFromManyUsers({ idUsersList: usersRejected }).catch(() => {});
};

const getLoggedUserController = async (req, res) => {
  try {
    const user = await getUser({ idUser: req.session.id, showSensitiveData: true });
    if (!user) throw new CustomError('El usuario indicado no existe.', 404);
    res.send(user);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al obtener la información del usuario.',
    });
  }
};

const getUserController = async (req, res) => {
  const { idUser } = req.params || null;
  try {
    const user = await getUser({ idUser, showSensitiveData: true });
    if (!user) throw new CustomError('El usuario indicado no existe.', 404);

    // Filtrar datos privados si no es admin
    let showSensitiveData = user.id === req.session.id;
    if (!showSensitiveData && req.session.role.includes(consts.roles.admin)) {
      showSensitiveData = true;
    }

    res.send(single(user, { showSensitiveData }));
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al obtener la información del usuario.',
    });
  }
};

const renewRegisterToken = async (req, res) => {
  const { idUser } = req.body;
  const session = await connection.startSession();
  const { role } = req.session;

  try {
    session.startTransaction();

    if (!role.includes(consts.roles.admin)) {
      throw new CustomError('El usuario no tiene acceso para realizar esta acción.', 403);
    }
    const user = await getUser({ idUser, showSensitiveData: true, session });
    if (!user) throw new CustomError('El usuario indicado no existe.', 404);

    if (user.completeRegistration) {
      throw new CustomError('El usuario indicado ya ha sido activado.', 400);
    }

    if (user.blocked) {
      throw new CustomError('El usuario se encuentra bloqueado.', 403);
    }

    await sendSingleUserRegisterEmail({
      userId: user.id,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      sex: user.sex,
      session,
    });

    await session.commitTransaction();

    res.send('Token enviado con éxito.');
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al generar el token de registro.', session,
    });
  } finally {
    session.endSession();
  }
};

const createUserController = async (req, res) => {
  const {
    code, name, lastname, email, promotion, career, sex, university, campus,
  } = req.body;

  const session = await connection.startSession();

  try {
    session.startTransaction();

    const user = await createUser({
      code,
      name,
      lastname,
      university,
      campus,
      email,
      promotion,
      career,
      sex,
      session,
    });

    await sendSingleUserRegisterEmail({
      userId: user.id,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      sex: user.sex,
      session,
    });

    await session.commitTransaction();

    res.send(single(user));
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al crear nuevo usuario.', session,
    });
  } finally {
    session.endSession();
  }
};

const updateUserController = async (req, res) => {
  const {
    name, lastname, email, promotion, career, sex, removeProfilePicture, password, university, campus,
  } = req.body;
  const { idUser } = req.params;

  const session = await connection.startSession();
  const isAdmin = req.session.role?.includes(consts.roles.admin);
  const isCurrentUser = req.session.id === idUser;
  const removePicture = parseBoolean(removeProfilePicture);

  let imageUploadedToBucket = false;

  try {
    session.startTransaction();

    // verificar que sea admin o el mismo usuario
    if (!isAdmin && !isCurrentUser) {
      throw new CustomError('No estás autorizado para modificar este usuario.', 403);
    }

    const passwordHash = (exists(password) && req.session.id === idUser) ? sha256(password) : null;

    let hasImage = null;
    if (removePicture) hasImage = false;
    else if (exists(req.uploadedFiles?.[0])) hasImage = true;

    const { dataBeforeChange } = await updateUser({
      idUser,
      name,
      lastname,
      email,
      promotion: isAdmin ? promotion : null, // solo admin puede modificar promoción
      university,
      campus,
      career,
      sex,
      passwordHash,
      hasImage,
      session,
    });

    // Actualizar tokens de usuario editado
    await forceSessionTokenToUpdate({ idUser, session });

    const fileKey = `${consts.bucketRoutes.user}/${idUser}`;
    if (dataBeforeChange.hasImage && (removePicture || hasImage)) {
      // Eliminar foto de perfil previa
      try {
        await deleteFileInBucket(fileKey);
      } catch {
        if (removePicture) {
          // El error solo es crítico si se especificó eliminar la imagen
          throw new CustomError('No se encontró la foto de perfil a eliminar.', 404);
        }
      }
    }

    if (hasImage) {
      // Subir nueva foto
      await saveUserProfilePicture({ file: req.uploadedFiles[0], idUser });
      imageUploadedToBucket = true;
    }

    await session.commitTransaction();

    session.endSession();

    res.sendStatus(204);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al actualizar usuario.', session,
    });

    session.endSession();

    // En caso de error, eliminar imagen cargada al bucket
    if (imageUploadedToBucket) {
      const fileKey = `${consts.bucketRoutes.user}/${idUser}`;
      deleteFileInBucket(fileKey).catch((err) => {
        if (err) writeLog(2, 'Error al eliminar imagen de usuario en bucket: ', err);
      });
    }
  } finally {
    // Eliminar archivo temporal
    if (exists(req.uploadedFiles?.[0])) {
      const filePath = `${global.dirname}/files/${req.uploadedFiles[0].fileName}`;
      fs.unlink(filePath, (err) => {
        if (err) writeLog(2, 'Error al eliminar archivo temporal de usuario: ', err);
      });
    }
  }
};

const getUsersListController = async (req, res) => {
  const {
    promotion, search, page, priority, role, includeBlocked, university,
  } = req.query;

  const { role: userRole } = req.session;
  const isAdmin = userRole.includes(consts.roles.admin);
  const isAreaResponsible = userRole.includes(consts.roles.asigboAreaResponsible);
  const isActivityResponsible = userRole.includes(consts.roles.activityResponsible);

  try {
    let forcedPromotionFilter = null;
    // Si el usuario cuenta solo con privilegios de encargado de año, aplicar filtro forzado
    if (!isAdmin && !isAreaResponsible && !isActivityResponsible) {
      forcedPromotionFilter = req.session.promotion;
    }

    const promotionObj = new Promotion();

    let promotionMin = null;
    let promotionMax = null;
    if (!forcedPromotionFilter && promotion) {
      // si se da un grupo de usuarios, definir rango de promociones
      if (Number.isNaN(parseInt(promotion, 10))) {
        const result = await promotionObj.getPromotionRange({ promotionGroup: promotion });
        promotionMin = result.promotionMin;
        promotionMax = result.promotionMax;
      }
    }

    const usersResult = await getUsersList({
      idUser: req.session.id,
      promotion: forcedPromotionFilter ?? (parseInt(promotion, 10) || null),
      university,
      search,
      role,
      promotionMin,
      promotionMax,
      page,
      priority: Array.isArray(priority) ? priority : [priority],
      includeBlocked,
    });

    if (!usersResult) throw new CustomError('No se encontraron resultados.', 404);
    const { pages, result } = usersResult;

    const parsedUsers = multiple(result, { showSensitiveData: isAdmin });

    const resultWithPromotionGroup = await Promise.all(
      parsedUsers.map(async (user) => ({
        ...user,
        promotionGroup: await promotionObj.getPromotionGroup(user.promotion),
      })),
    );

    res.send({
      result: resultWithPromotionGroup,
      pages,
      resultsPerPage: consts.resultsNumberPerPage,
    });
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al obtener los usuarios activos.',
    });
  }
};

const getAdminUsersController = async (req, res) => {
  try {
    const usersResult = await getUsersList({
      idUser: req.session.id,
      role: consts.roles.admin,
      page: null,
      showRole: true, // mostrar role si es admin
    });
    if (!usersResult) throw new CustomError('No se encontraron resultados.', 404);
    const { result } = usersResult;
    res.send(multiple(result));
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al obtener los usuarios administradores.',
    });
  }
};

const validateRegisterTokenController = async (req, res) => {
  const token = req.headers?.authorization;
  const idUser = req.session?.id;

  try {
    await validateAlterUserToken({ idUser, token });
    res.sendStatus(204);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al validar token de registro.',
    });
  }
};

const validateRecoverTokenController = async (req, res) => {
  const token = req.headers?.authorization;
  const idUser = req.session?.id;

  try {
    await validateAlterUserToken({ idUser, token });
    res.sendStatus(204);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al validar token para recuperación de contraseña.',
    });
  }
};

const finishRegistrationController = async (req, res) => {
  const { password } = req.body;
  const idUser = req.session.id;

  const passwordHash = sha256(password);
  const hasImage = exists(req.uploadedFiles?.[0]);
  const session = await connection.startSession();

  let imageUploadedToBucket = false;

  try {
    session.startTransaction();

    await updateUser({
      idUser, passwordHash, hasImage, session,
    });

    // eliminar tokens para modificar usuario
    await deleteAllUserAlterTokens({ idUser, session });

    // Subir imagen al bucket
    if (hasImage) {
      await saveUserProfilePicture({ file: req.uploadedFiles[0], idUser });
      imageUploadedToBucket = true;
    }

    await session.commitTransaction();

    session.endSession();

    res.sendStatus(204);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al finalizar registro de nuevo usuario.', session,
    });

    session.endSession();

    // En caso de error, eliminar imagen cargada al bucket
    if (imageUploadedToBucket) {
      const fileKey = `${consts.bucketRoutes.user}/${idUser}`;
      deleteFileInBucket(fileKey).catch((err) => {
        if (err) writeLog(2, 'Error al eliminar imagen de usuario en bucket: ', err);
      });
    }
  } finally {
    // Eliminar archivo temporal
    if (hasImage) {
      const filePath = `${global.dirname}/files/${req.uploadedFiles[0].fileName}`;
      fs.unlink(filePath, (err) => {
        if (err) writeLog(2, 'Error al eliminar archivo temporal de usuario: ', err);
      });
    }
  }
};

const assignAdminRoleController = async (req, res) => {
  const { idUser } = req.params;

  const session = await connection.startSession();
  try {
    session.startTransaction();
    await addRoleToUser({ idUser, role: consts.roles.admin, session });

    // actualizar sesión del usuario
    await forceSessionTokenToUpdate({ idUser, session });

    await session.commitTransaction();

    res.sendStatus(204);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al asignar privilegios de administrador al usuario.', session,
    });
  } finally {
    session.endSession();
  }
};

const removeAdminRoleController = async (req, res) => {
  const { idUser } = req.params;
  const session = await connection.startSession();

  try {
    session.startTransaction();

    // verificar que haya más de dos admins
    const usersResult = await getUsersList({
      idUser: req.session.id,
      role: consts.roles.admin,
      page: null,
    });

    if (!usersResult || usersResult.result.length <= 1) {
      throw new CustomError(
        'No es posible eliminar a todos los administradores. En todo momento debe existir por lo menos uno.',
        400,
      );
    }

    await removeRoleFromUser({ idUser, role: consts.roles.admin, session });

    // actualizar sesión del usuario
    await forceSessionTokenToUpdate({ idUser, session });

    await session.commitTransaction();

    res.sendStatus(204);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al remover privilegios de administrador al usuario.', session,
    });
  } finally {
    session.endSession();
  }
};

const assignPromotionResponsibleRoleController = async (req, res) => {
  const { idUser } = req.params;

  const session = await connection.startSession();
  try {
    session.startTransaction();
    await addRoleToUser({ idUser, role: consts.roles.promotionResponsible, session });

    // actualizar sesión del usuario
    await forceSessionTokenToUpdate({ idUser, session });

    await session.commitTransaction();

    res.sendStatus(204);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al asignar privilegios de encargado de promoción al usuario.', session,
    });
  } finally {
    session.endSession();
  }
};

const removePromotionResponsibleRoleController = async (req, res) => {
  const { idUser } = req.params;
  const session = await connection.startSession();

  try {
    session.startTransaction();

    await removeRoleFromUser({ idUser, role: consts.roles.promotionResponsible, session });

    // actualizar sesión del usuario
    await forceSessionTokenToUpdate({ idUser, session });

    await session.commitTransaction();

    res.sendStatus(204);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al remover privilegios de encargado de promoción al usuario.', session,
    });
  } finally {
    session.endSession();
  }
};

const getPromotionResponsibleUsersController = async (req, res) => {
  const { promotion } = req.query;
  try {
    const usersResult = await getUsersList({
      role: consts.roles.promotionResponsible,
      page: null,
      promotion,
    });
    if (!usersResult) throw new CustomError('No se encontraron resultados.', 404);
    const { result } = usersResult;

    res.send(multiple(result));
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al obtener los usuarios encargados de promoción.',
    });
  }
};

const disableUserController = async (req, res) => {
  const { idUser } = req.params;
  const session = await connection.startSession();
  try {
    session.startTransaction();

    // Evitar bloquearse a sí mismo
    if (idUser === req.session.id) {
      throw new CustomError('Un usuario no puede bloquearse a sí mismo.', 400);
    }

    await updateUserBlockedStatus({ idUser, blocked: true });

    // Eliminar session y alteruser tokens
    await deleteAllUserSessionTokens({ idUser, session });
    await deleteAllUserAlterTokens({ idUser, session });

    await session.commitTransaction();
    res.sendStatus(204);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error deshabilitar usuario.', session,
    });
  } finally {
    session.endSession();
  }
};

const enableUserController = async (req, res) => {
  const { idUser } = req.params;

  try {
    await updateUserBlockedStatus({ idUser, blocked: false });

    res.sendStatus(204);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error deshabilitar usuario.',
    });
  }
};

const deleteUserController = async (req, res) => {
  const { idUser } = req.params;
  const session = await connection.startSession();
  try {
    session.startTransaction();

    // evitar que el usuario se elimine a sí mismo
    if (idUser === req.session.id) {
      throw new CustomError('Un usuario no puede eliminarse a sí mismo.', 400);
    }

    // verificar que el usuario no haya realizado acciones
    const responsibleAreas = await getAreasWhereUserIsResponsible({ idUser, session });

    if (responsibleAreas?.length > 0) {
      throw new CustomError(
        'No es posible eliminar el usuario, pues este figura como encargado de al menos un eje de ASIGBO.',
        400,
      );
    }

    const responsibleActivities = await getActivitiesWhereUserIsResponsible({ idUser, session });

    if (responsibleActivities?.length > 0) {
      throw new CustomError(
        'No es posible eliminar el usuario, pues este figura como encargado de al menos una actividad.',
        400,
      );
    }

    const hasActivityAssignments = await verifyIfUserIsAssignedToAnyActivity({ idUser, session });
    if (hasActivityAssignments) {
      throw new CustomError(
        'No es posible eliminar el usuario, pues este ha sido inscrito en al menos una actividad.',
        400,
      );
    }

    // verificar que no haya realizado pagos (pendiente)
    const hasPaymentAssignments = await verifyIfUserHasPaymentAssignments({ idUser, session });
    if (hasPaymentAssignments) {
      throw new CustomError('No es posible eliminar al usuario, pues este tiene pagos asignados.');
    }

    // Verificar que no sea tesorero
    const isTreasurer = await hasPaymentsAsTreasurer({ idUser, session });
    if (isTreasurer) {
      throw new CustomError('No es posible eliminar al usuario, pues este figura como tesorero en al menos un pago.');
    }

    await deleteUser({ idUser, session });

    // Forzar logout
    await forceUserLogout(idUser, session);

    // Eliminar session y alteruser tokens
    await deleteAllUserSessionTokens({ idUser, session });
    await deleteAllUserAlterTokens({ idUser, session });

    // eliminar foto de perfil
    try {
      const fileKey = `${consts.bucketRoutes.user}/${idUser}`;
      await deleteFileInBucket(fileKey);
    } catch (ex) {
      // Error no critico. Fallo al eliminar foto
    }

    await session.commitTransaction();
    res.sendStatus(204);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al eliminar usuario.', session,
    });
  } finally {
    session.endSession();
  }
};

const uploadUsersController = async (req, res) => {
  const { data: users, sendEmail } = req.body;
  const session = await connection.startSession();
  try {
    session.startTransaction();
    const savedUsers = await uploadUsers({ users, session });

    if (!exists(sendEmail) || parseBoolean(sendEmail) === true) {
      await sendManyUserRegisterEmail({ users: savedUsers, session });
    }

    await session.commitTransaction();

    res.send(savedUsers);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al insertar la información de usuarios en lista.', session,
    });
  } finally {
    session.endSession();
  }
};

const recoverPasswordController = async (req, res) => {
  const { email } = req.body;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // Verificar que el email ingresado existe en la base de datos
    const user = await getUserByMail({ email });
    if (!user) throw new CustomError('El email indicado no corresponde a ningún usuario.', 404);
    if (user.blocked) throw new CustomError('El usuario se encuentra bloqueado.', 403);

    // guardar token para completar registro
    const token = signRecoverPasswordToken({
      id: user.id,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
    });
    await saveAlterToken({
      idUser: user.id, token, type: consts.token.recover, session,
    });

    // enviar email de notificación
    const emailSender = new RecoverPasswordEmail();
    emailSender.sendEmail({
      addresseeEmail: email,
      name: user.name,
      recoverToken: token,
    });

    await session.commitTransaction();
    res.send({ result: `Correo de recuperación enviado a ${email}` });
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error en proceso de recuperación de contraseña.', session,
    });
  } finally {
    session.endSession();
  }
};

const updateUserPasswordController = async (req, res) => {
  const { password } = req.body;
  const idUser = req.session.id;

  const passwordHash = sha256(password);
  const session = await connection.startSession();

  try {
    session.startTransaction();

    await updateUserPassword({ idUser, passwordHash, session });
    // eliminar tokens para modificar usuario
    await deleteAllUserAlterTokens({ idUser, session });

    await session.commitTransaction();

    res.sendStatus(204);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al actualizar contraseña.', session,
    });
  } finally {
    session.endSession();
  }
};

const renewManyRegisterTokensController = async (req, res) => {
  const session = await connection.startSession();
  const { promotion } = req.body;

  try {
    session.startTransaction();

    const promotionObj = new Promotion();

    let promotionMin = null;
    let promotionMax = null;
    // si se da un grupo de usuarios, definir rango de promociones
    if (promotion && Number.isNaN(parseInt(promotion, 10))) {
      const result = await promotionObj.getPromotionRange({ promotionGroup: promotion });
      promotionMin = result.promotionMin;
      promotionMax = result.promotionMax;
    }

    const users = await getUnregisteredUsers({ promotion, promotionMin, promotionMax });

    await sendManyUserRegisterEmail({ users, session });

    await session.commitTransaction();
    res.sendStatus(204);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al reenviar correos de registro.', session,
    });
  } finally {
    session.endSession();
  }
};

const generateUsersReport = async ({ users, includeHasImageParam = false }) => {
  const areas = await getAreas({ showSensitiveData: true });
  if (!areas) throw new CustomError('No se encontraron áreas de ASIGBO.', 404);

  const areasNames = areas.map((area) => area.name);

  const report = users.map((user) => {
    const result = {
      id: user.id,
      name: user.name,
      lastname: user.lastname,
      promotion: user.promotion,
      career: user.career,
      university: user.university,
      campus: user.campus,
      sex: user.sex,
      totalHours: user.serviceHours?.total ?? 0,
      activitiesCompleted: user.serviceHours?.activitiesCompleted ?? 0,
      hasImage: user.hasImage,
    };

    if (!includeHasImageParam) delete result.hasImage;

    // Agregar todas las áreas con un default de 0
    areasNames.forEach((area) => {
      result[area] = 0;
    });

    // Reemplazar valores de áreas con valores reales
    user.serviceHours?.areas?.forEach((area) => {
      result[area.asigboArea.name] = area.total;
    });

    return result;
  });

  return report;
};

const getUserReportController = async (req, res) => {
  const { promotion, page } = req.query;
  try {
    const promotionObj = new Promotion();

    let promotionMin = null;
    let promotionMax = null;
    // si se da un grupo de usuarios, definir rango de promociones
    if (promotion && Number.isNaN(parseInt(promotion, 10))) {
      const result = await promotionObj.getPromotionRange({ promotionGroup: promotion });
      promotionMin = result.promotionMin;
      promotionMax = result.promotionMax;
    }

    const listResult = await getUsersList({
      promotion, promotionMin, promotionMax, page,
    });
    if (!listResult) throw new CustomError('No se encontraron usuarios.', 404);

    const { pages, result: users } = listResult;
    const report = await generateUsersReport({ users, includeHasImageParam: true });
    res.send({ pages, result: report });
  } catch (ex) {
    await errorSender({ res, ex, defaultError: 'Ocurrió un error al obtener reporte de usuarios.' });
  }
};

const getUserReportFileController = async (req, res) => {
  const { promotion } = req.query;
  try {
    const promotionObj = new Promotion();

    let promotionMin = null;
    let promotionMax = null;
    // si se da un grupo de usuarios, definir rango de promociones
    if (promotion && Number.isNaN(parseInt(promotion, 10))) {
      const result = await promotionObj.getPromotionRange({ promotionGroup: promotion });
      promotionMin = result.promotionMin;
      promotionMax = result.promotionMax;
    }

    const users = await getUsersByPromotion({
      promotion, promotionMin, promotionMax, showSensitiveData: true, sort: true,
    });
    const report = await generateUsersReport({ users });
    const filePath = `${global.dirname}/files/${Date.now()}.xlsx`;
    await jsonToExcel({ data: report, outputPath: filePath, sheetName: 'Reporte de usuarios' });

    res.status(200).sendFile(filePath, () => {
      // eliminar archivo generado
      fs.unlink(filePath, (err) => { writeLog('Error al eliminar archivo de reporte de usuarios: ', err); });
    });
  } catch (ex) {
    await errorSender({ res, ex, defaultError: 'Ocurrió un error al obtener reporte de usuarios.' });
  }
};

export {
  createUserController,
  getUsersListController,
  getUserController,
  getLoggedUserController,
  validateRegisterTokenController,
  finishRegistrationController,
  getAdminUsersController,
  assignAdminRoleController,
  removeAdminRoleController,
  disableUserController,
  enableUserController,
  deleteUserController,
  updateUserController,
  renewRegisterToken,
  uploadUsersController,
  recoverPasswordController,
  updateUserPasswordController,
  validateRecoverTokenController,
  assignPromotionResponsibleRoleController,
  removePromotionResponsibleRoleController,
  getPromotionResponsibleUsersController,
  renewManyRegisterTokensController,
  getUserReportController,
  getUserReportFileController,
};

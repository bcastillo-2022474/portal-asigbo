import { ObjectId } from 'mongodb';
import moment from 'moment';
import AlterUserTokenSchema from '../../db/schemas/alterUserToken.schema.js';
import UserSchema from '../../db/schemas/user.schema.js';
import consts from '../../utils/consts.js';
import CustomError from '../../utils/customError.js';
import exists, { someExists } from '../../utils/exists.js';
import { multiple, single } from './user.dto.js';
import AsigboAreaSchema from '../../db/schemas/asigboArea.schema.js';
import compareObjectId from '../../utils/compareObjectId.js';
import ActivitySchema from '../../db/schemas/activity.schema.js';
import ActivityAssignmentSchema from '../../db/schemas/activityAssignment.schema.js';
import PaymentSchema from '../../db/schemas/payment.schema.js';
import PaymentAssignmentSchema from '../../db/schemas/paymentAssignment.schema.js';
import writeLog from '../../utils/writeLog.js';
import getSearchRegex from '../../utils/getSearchRegex.js';
import getUTCDate from '../../utils/getUTCDate.js';

const getUser = async ({ idUser, showSensitiveData, session }) => {
  try {
    const user = await UserSchema.findById(idUser).session(session);
    if (!user) return null;

    return single(user, { showSensitiveData });
  } catch (ex) {
    if (ex?.kind === 'ObjectId') {
      throw new CustomError('El id del usuario no es válido.', 400);
    }
    throw ex;
  }
};

const getUserByCode = async ({ code, session }) => {
  try {
    const user = await UserSchema.findOne({ code }).session(session);
    if (user === null) throw new CustomError('El usuario indicado no existe.', 404);

    return single(user, { showSensitiveData: false });
  } catch (ex) {
    if (ex?.kind === 'ObjectId') {
      throw new CustomError('El id del usuario no es válido.', 400);
    }
    throw ex;
  }
};

const getUserByMail = async ({ email }) => {
  const user = await UserSchema.findOne({ email });
  if (!user) return null;
  return single(user, { showSensitiveData: true });
};

const getUsersInList = async ({
  idUsersList, showSensitiveData = false, session, missingUserError = 'Algunos de los usuarios no existen.',
}) => {
  try {
    const user = await UserSchema.find({ _id: { $in: idUsersList } }).session(session);
    if (user?.length !== idUsersList.length) throw new CustomError(missingUserError, 404);

    return multiple(user, showSensitiveData);
  } catch (ex) {
    if (ex?.kind === 'ObjectId') {
      throw new CustomError('El id del usuario no es válido.', 400);
    }
    throw ex;
  }
};

const getUsersByPromotion = async ({
  promotion, promotionMin, promotionMax, includeBlocked = false, showSensitiveData = false, sort = false, session,
}) => {
  const query = {};

  if (!includeBlocked) query.blocked = false;
  if (someExists(promotion, promotionMin, promotionMax)) query.promotion = {};
  if (exists(promotion) && !exists(promotionMin) && !exists(promotionMax)) query.promotion.$eq = promotion;
  if (exists(promotionMin)) query.promotion.$gte = promotionMin;
  if (exists(promotionMax)) query.promotion.$lte = promotionMax;

  let userQuery = UserSchema.find(query).session(session);
  if (sort) userQuery = userQuery.sort({ promotion: -1, _id: -1 });

  const user = await userQuery;

  if (user.length === 0) return null;

  return multiple(user, { showSensitiveData });
};

const createUser = async ({
  code,
  name,
  lastname,
  university,
  campus,
  email,
  promotion,
  career,
  role,
  sex,
  session,
}) => {
  try {
    const user = new UserSchema();

    user.code = code ?? null;
    user.name = name?.trim();
    user.lastname = lastname?.trim();
    user.email = email?.trim();
    user.promotion = promotion;
    user.career = career?.trim();
    user.role = role;
    user.passwordHash = null;
    user.sex = sex?.trim();
    user.university = university?.trim();
    user.campus = campus?.trim();

    await user.save({ session });
    return single(user, { showSensitiveData: true });
  } catch (ex) {
    if (ex.code === 11000 && ex.keyValue?.code !== undefined) {
      throw new CustomError('El código proporcionado ya existe.', 400);
    }
    if (ex.code === 11000 && ex.keyValue?.email !== undefined) {
      throw new CustomError('El email ya se encuentra registrado.', 400);
    }
    if (ex.code === 'ERR_ASSERTION' && ex.path === 'code') {
      throw new CustomError('El código de usuario debe ser un número.');
    }
    throw ex;
  }
};

/**
 * Permite actualizar los datos redundantes del usuario en otras colecciones.
 * @param {userSubSchema} user: Schema resultante de la actualización del usuario
 */
const updateUserInAllDependencies = async ({ user, session }) => {
  // actualizar responsables de área de asigbo
  await AsigboAreaSchema.updateMany(
    { 'responsible._id': user._id },
    { $set: { 'responsible.$': user } },
    { session, multi: true },
  );

  // responsables de actividad
  await ActivitySchema.updateMany(
    { 'responsible._id': user._id },
    { $set: { 'responsible.$': user } },
    { session, multi: true },
  );

  // asignaciones
  await ActivityAssignmentSchema.updateMany(
    { 'user._id': user._id },
    { user },
    { session },
  );

  // Tesorero en pago
  await PaymentSchema.updateMany(
    { 'treasurer._id': user._id },
    { $set: { 'treasurer.$': user } },
    { session, multi: true },
  );

  // Tesorero en asignación de pago
  await PaymentAssignmentSchema.updateMany(
    { 'treasurer._id': user._id },
    { user },
    { session },
  );

  // Usuario en asignación de pago
  await PaymentAssignmentSchema.updateMany(
    { 'user._id': user._id },
    { user },
    { session },
  );
};

/**
 * Actualiza la información de un usuario
 * @returns {object} {dataBeforeChange, dataAfterChange} Contienen los datos antes y después de
 * la actualización respectivamente.
 */
const updateUser = async ({
  idUser,
  name,
  lastname,
  email,
  university,
  campus,
  promotion,
  career,
  sex,
  passwordHash,
  hasImage,
  session,
}) => {
  try {
    const user = await UserSchema.findById(idUser);

    if (!user) throw new CustomError('No se encontró el usuario.', 404);

    const dataBeforeChange = single(user, { showSensitiveData: true });

    if (exists(name)) user.name = name?.trim();
    if (exists(lastname)) user.lastname = lastname?.trim();
    if (exists(email)) user.email = email?.trim();
    if (exists(promotion)) user.promotion = promotion;
    if (exists(career)) user.career = career?.trim();
    if (exists(sex)) user.sex = sex?.trim();
    if (exists(passwordHash)) user.passwordHash = passwordHash;
    if (exists(hasImage)) user.hasImage = hasImage;
    if (exists(university)) user.university = university?.trim();
    if (exists(campus)) user.campus = campus?.trim();

    await user.save({ session });

    // actualizar data del usuario en otras colecciones
    if (exists(name) || exists(lastname) || exists(promotion) || exists(hasImage)) {
      await updateUserInAllDependencies({ user, session });
    }

    return { dataBeforeChange, dataAfterChange: single(user, { showSensitiveData: true }) };
  } catch (ex) {
    if (ex.code === 11000 && ex.keyValue?.code !== undefined) {
      throw new CustomError('El código proporcionado ya existe.', 400);
    }
    if (ex.code === 11000 && ex.keyValue?.email !== undefined) {
      throw new CustomError('El email ya se encuentra registrado.', 400);
    }
    if (ex.code === 'ERR_ASSERTION' && ex.path === 'code') {
      throw new CustomError('El código de usuario debe ser un número.');
    }
    throw ex;
  }
};

/**
 * Retorna la lista de usuarios.
 * @param idUser
 * @param promotion filtro para buscar una promoción en específico.
 * @param university filtro para buscar una universidad en específico.
 * @param search subcadena a buscar en el nombre del usuario.
 * @param role role del usuario.
 * @param promotionMin filtro para buscar promociones por arriba de ese año. No incluye a ese valor.
 * @param promotionMax filtro para buscar promociones por abajo de ese año. No incluye a ese valor.
 * @param page número de pagina en los resultados
 * @param includeBlocked Boolean. Indica si se incluyen los usuarios bloqueados. Default false.
 * @returns User dto Array. Se muestran todos los datos sensibles.
 */
const getUsersList = async ({
  promotion,
  university,
  search,
  role,
  promotionMin,
  promotionMax,
  priority,
  page = 0,
  includeBlocked = false,
}) => {
  const query = {};

  if (!includeBlocked) query.blocked = false;
  if (someExists(promotion, promotionMin, promotionMax)) query.promotion = {};
  if (exists(promotion) && !exists(promotionMin) && !exists(promotionMax)) query.promotion.$eq = promotion;
  if (exists(promotionMin)) query.promotion.$gte = promotionMin;
  if (exists(promotionMax)) query.promotion.$lte = promotionMax;
  if (exists(university)) query.university.$eq = university;
  if (exists(role)) query.role = { $in: [role] };
  if (search) {
    // buscar cadena en nombre completo
    const searchRegex = new RegExp(getSearchRegex(search), 'i');
    query.$or = [
      { $expr: { $regexMatch: { input: { $concat: ['$name', ' ', '$lastname'] }, regex: searchRegex } } },
    ];
  }

  // parsear id de usuarios prioritarios
  const parsedPriority = priority?.map((id) => {
    if (!exists(id)) return null;
    try {
      return new ObjectId(id);
    } catch (ex) {
      return null;
    }
  }) ?? [];

  // obtener número de páginas
  const usersCount = await UserSchema.countDocuments(query);

  if (usersCount === 0) return null;

  const pages = Math.ceil(usersCount / consts.resultsNumberPerPage);

  const queryPipeline = [
    {
      $match: query,
    },
    {
      $addFields: {
        order: {
          $in: ['$_id', parsedPriority], // obtener valor si el id aparece en priority
        },
        priorityIndex: {
          $indexOfArray: [parsedPriority, '$_id'],
        },
      },
    },
    {
      $sort: {
        order: -1, // priorizar id's que si aparecen
        priorityIndex: 1,
        promotion: -1,
        _id: 1,
      },
    },
  ];

  if (page) {
    queryPipeline.push({
      $skip: page * consts.resultsNumberPerPage,
    });
    queryPipeline.push({
      $limit: consts.resultsNumberPerPage,
    });
  }

  const users = await UserSchema.aggregate(queryPipeline);

  if (users.length === 0) return null;

  return { pages, result: multiple(users, { showSensitiveData: true }) };
};

const updateServiceHours = async ({
  userId,
  asigboAreaId,
  hoursToRemove = 0,
  hoursToAdd = 0,
  session,
}) => {
  const user = await UserSchema.findById(userId).session(session);

  if (!user) throw new CustomError('El usuario no existe.', 400);
  const serviceHoursAreas = Array.isArray(user.serviceHours?.areas) ? user.serviceHours?.areas : [];

  // Se retira el valor anterior y se ingresa el valor actualidado (previous - new)
  // Si no hay un valor previo en la bd, se ignora y se toma como si fuera 0

  const area = serviceHoursAreas.find((data) => data?.asigboArea && compareObjectId(data.asigboArea._id, asigboAreaId));
  const remainingAreas = serviceHoursAreas.filter((data) => data?.asigboArea && !compareObjectId(data.asigboArea._id, asigboAreaId));

  const newAreaHours = area !== undefined
    ? area.total - hoursToRemove + hoursToAdd
    : hoursToAdd - hoursToRemove;

  const newTotalHours = user.serviceHours?.total !== undefined
    ? user.serviceHours.total - hoursToRemove + hoursToAdd
    : hoursToAdd - hoursToRemove;

  const newAreaModel = {};
  if (!area) {
    // buscar datos del área de asigbo
    const asigboAreaData = await AsigboAreaSchema.findById(asigboAreaId).session(session);
    if (!asigboAreaData) throw new CustomError('El area de asigbo no existe.', 404);

    newAreaModel.asigboArea = asigboAreaData;
    newAreaModel.total = newAreaHours;
  } else {
    // modificar datos existentes
    area.total = newAreaHours;
  }

  user.serviceHours.areas = [...remainingAreas, area ?? newAreaModel];
  user.serviceHours.total = newTotalHours;

  return user.save({ session });
};

const updateActivitiesCompletedNumber = async ({
  idUser, add, remove, session,
}) => {
  const { acknowledged, matchedCount } = await UserSchema.updateOne(
    { _id: idUser },
    {
      $inc: {
        'serviceHours.activitiesCompleted': (add ?? 0) - (remove ?? 0),
      },
    },
    { session },
  );

  if (matchedCount === 0) throw new CustomError('El usuario no existe.', 400);
  if (!acknowledged) throw new CustomError('No se pudo actualizar el número de actividades completadas.', 500);
};

/**
 * Permite agregar un rol a un usuario.
 * @param idUser id del usuario a modificar.
 * @param role role a añadir.
 * @session objeto session de la transacción de bd.
 * @returns Boolean. Retorna true si el rol fue añadido y false si el usuario ya poseía el rol, por
 * lo que no le fue asignado.
 */
const addRoleToUser = async ({ idUser, role, session }) => {
  try {
    const result = await UserSchema.updateOne({ _id: idUser }, { $addToSet: { role } }, { session });
    const { acknowledged, matchedCount, modifiedCount } = result;

    if (matchedCount === 0) throw new CustomError('No se encontró el usuario.', 404);
    if (!acknowledged) throw new CustomError('No fue posible asignar el role.', 500);

    return modifiedCount === 1;
  } catch (ex) {
    if (ex?.kind === 'ObjectId') {
      throw new CustomError('El id del usuario no es válidos.', 400);
    }
    throw ex;
  }
};

const addRoleToManyUsers = async ({ usersIdList = [], role, session }) => {
  if (!Array.isArray(usersIdList)) throw Error('UsersIdList no es un arreglo.');

  try {
    // añadir roles en caso de que no exista un array en el campo role
    const { matchedCount: matchedCount1 } = await UserSchema.updateMany(
      {
        $or: [{ role: { $exists: false } }, { role: { $not: { $type: 'array' } } }],
        _id: { $in: usersIdList },
      },
      { $set: { role: [role] } },
      { session },
    );

    const { matchedCount: matchedCount2 } = await UserSchema.updateMany(
      {
        role: { $exists: true, $type: 'array' },
        _id: { $in: usersIdList },
      },
      { $addToSet: { role } },
      { session },
    );

    if (matchedCount1 + matchedCount2 !== usersIdList.length) {
      throw new CustomError('Ocurrió un error al asignar permisos a usuarios.', 500);
    }
  } catch (ex) {
    if (ex?.kind === 'ObjectId') {
      throw new CustomError('Los id de los usuarios no son validos.', 400);
    }
    throw ex;
  }
};

const removeRoleFromUser = async ({ idUser, role, session }) => {
  try {
    const userData = await UserSchema.findOne({ _id: idUser });

    if (userData === null) {
      throw new CustomError('No se encontró el usuario para eliminar rol.', 404);
    }
    if (!userData.role?.includes(role)) {
      throw new CustomError('El usuario no posee el role proporcionado.', 400);
    }

    userData.role = userData.role.filter((val) => val !== role);

    const result = await userData.save({ session });

    return single(result);
  } catch (ex) {
    if (ex?.kind === 'ObjectId') {
      throw new CustomError('Los id de los usuarios no son validos.', 400);
    }
    throw ex;
  }
};

const saveAlterToken = async ({
  idUser, token, type, session,
}) => {
  try {
    // eliminar tokens previos del usuario
    await AlterUserTokenSchema.deleteMany({ idUser }, { session });

    const alterUserToken = new AlterUserTokenSchema();

    alterUserToken.idUser = idUser;
    alterUserToken.token = token;
    alterUserToken.tokenType = type;
    alterUserToken.date = getUTCDate();

    await alterUserToken.save({ session });
  } catch (ex) {
    if (ex.code === 11000 && ex.keyValue?.idUser !== undefined) {
      throw new CustomError('El usuario ya posee un token de modificación previo.', 400);
    }
    throw ex;
  }
};

/**
 * @param data Array de objetos {idUser, token}
 */
const saveManyRegisterToken = async ({ data, session }) => {
  try {
    // eliminar tokens previos
    const usersList = data.map((objectData) => objectData.idUser);
    await AlterUserTokenSchema.deleteMany({ idUser: { $in: usersList } });

    // guardar nuevos tokens
    await AlterUserTokenSchema.insertMany(data, { session });
  } catch (ex) {
    if (ex.code === 11000 && ex.keyValue?.idUser !== undefined) {
      throw new CustomError('El usuario ya posee un token de modificación previo.', 400);
    }
    throw ex;
  }
};

const deleteAllAlterTokensFromManyUsers = async ({ idUsersList, session }) => AlterUserTokenSchema.deleteMany({ idUser: { $in: idUsersList } }, { session });

const validateAlterUserToken = async ({ idUser, token }) => {
  const result = await AlterUserTokenSchema.findOne({ idUser, token });
  if (result === null) throw new CustomError('El token de modificación no es válido.', 401);

  return true;
};

const deleteAlterUserToken = async ({ token, session }) => AlterUserTokenSchema.deleteOne({ token }, { session });

const deleteAllUserAlterTokens = async ({ idUser, session }) => AlterUserTokenSchema.deleteMany({ idUser }, { session });

const updateUserPassword = async ({ idUser, passwordHash, session }) => {
  const user = await UserSchema.findById(idUser);

  if (user === null) throw new CustomError('El usuario no existe.', 400);

  user.passwordHash = passwordHash;

  if (!user.university) {
    user.university = 'temporary';
    user.campus = 'temporary';
  }

  await user.save({ session });
};

const updateUserBlockedStatus = async ({ idUser, blocked, session }) => {
  try {
    const { acknowledged, matchedCount } = await UserSchema.updateOne({ _id: idUser }, { blocked }, { session });

    if (!matchedCount) throw new CustomError('No se encontró al usuario a modificar.', 404);
    if (!acknowledged) throw new CustomError('No fue posible realizar la modificación del status blocked.', 500);
  } catch (ex) {
    if (ex?.kind === 'ObjectId') {
      throw new CustomError('El id del usuario no es válido.', 404);
    }
    throw ex;
  }
};

const deleteUser = async ({ idUser, session }) => {
  try {
    const { deletedCount, acknowledged } = await UserSchema.deleteOne({ _id: idUser }, { session });
    if (!acknowledged) throw new CustomError('No se encontró el usuario a eliminar.', 404);
    if (deletedCount !== 1) throw new CustomError('No se pudo eliminar el usuario.', 500);
  } catch (ex) {
    if (ex?.kind === 'ObjectId') {
      throw new CustomError('El id del usuario no es válido.', 404);
    }
    throw ex;
  }
};

const uploadUsers = async ({ users, session }) => {
  try {
    if (!users || users.length === 0) throw new CustomError('Debe enviar por lo menos un registro.', 400);

    // Realizar .trim() a los campos de texto
    const parsedUsers = users.map((user) => ({
      ...user,
      name: user.name?.trim(),
      lastname: user.lastname?.trim(),
      university: user.university?.trim(),
      campus: user.campus?.trim(),
      email: user.email?.trim(),
      career: user.career?.trim(),
      sex: user.sex?.trim(),
    }));

    const savedUsers = await UserSchema.insertMany(parsedUsers, { session });
    return savedUsers;
  } catch (ex) {
    if (ex.errors) throw new CustomError(ex.errors[Object.keys(ex.errors)].message, 400);
    if (ex.code === 11000) {
      if (ex.message.includes('code')) throw new CustomError(`El código ${ex.writeErrors[0].err.op.code} ya existe en la base de datos`, 400);
      throw new CustomError(`El correo ${ex.writeErrors[0].err.op.email} ya existe en la base de datos`, 400);
    }
    throw ex;
  }
};

const getUnregisteredUsers = async ({
  promotion, promotionMin, promotionMax, includeBlocked = false,
}) => {
  const query = { passwordHash: { $exists: false } };

  if (someExists(promotion, promotionMin, promotionMax)) query.promotion = {};
  if (exists(promotion) && !exists(promotionMin) && !exists(promotionMax)) query.promotion.$eq = promotion;
  if (exists(promotionMin)) query.promotion.$gte = promotionMin;
  if (exists(promotionMax)) query.promotion.$lte = promotionMax;
  if (!includeBlocked) query.blocked = false;

  const users = await UserSchema.find(query);

  return multiple(users, { showSensitiveData: true });
};

/**
 * Función que se encarga de eliminar todos los session tokens de más de un día de antiguedad.
 */
const deleteExpiredAlterTokens = async () => {
  try {
    const registerExpiration = moment().subtract(consts.tokenExpiration.register_months_expiration, 'month').toDate();
    const recoverExpiration = moment().subtract(consts.tokenExpiration.recover_hours_expiration, 'hour').toDate();

    await AlterUserTokenSchema.deleteMany({ date: { $lt: registerExpiration }, tokenType: consts.token.register });
    await AlterUserTokenSchema.deleteMany({ date: { $lt: recoverExpiration }, tokenType: consts.token.recover });
  } catch (ex) {
    writeLog(2, ex);
  }
};

export {
  createUser,
  getUsersList,
  updateServiceHours,
  getUser,
  addRoleToManyUsers,
  removeRoleFromUser,
  saveAlterToken,
  saveManyRegisterToken,
  validateAlterUserToken,
  deleteAlterUserToken,
  updateUserPassword,
  deleteAllUserAlterTokens,
  addRoleToUser,
  updateUserBlockedStatus,
  deleteUser,
  updateUser,
  getUsersInList,
  uploadUsers,
  getUserByMail,
  updateUserInAllDependencies,
  updateActivitiesCompletedNumber,
  getUserByCode,
  getUnregisteredUsers,
  deleteAllAlterTokensFromManyUsers,
  getUsersByPromotion,
  deleteExpiredAlterTokens,
};

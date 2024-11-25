import { ObjectId } from 'mongodb';
import ActivitySchema from '../../db/schemas/activity.schema.js';
import ActivityAssignmentSchema from '../../db/schemas/activityAssignment.schema.js';
import AsigboAreaSchema from '../../db/schemas/asigboArea.schema.js';
import UserSchema from '../../db/schemas/user.schema.js';
import consts from '../../utils/consts.js';
import CustomError from '../../utils/customError.js';
import exists, { someExists } from '../../utils/exists.js';
import { multiple as multipleActivityDto, single as singleActivityDto } from './activity.dto.js';
import getUTCDate from '../../utils/getUTCDate.js';
import getSearchRegex from '../../utils/getSearchRegex.js';

/**
 * Permite validar si un usuario es un encargado de un eje de asigbo.
 * @param idUser Id del usuario a verificar.
 * @param idArea Id de la actividad en donde se va a verificar si el usuario es encargado.
 * @param preventError. Default false. Evita que se lance una excepción al no ser el encargado.
 * Por defecto, Lanza un CustomError si el usuario no posee dicho privilegio.
 * @return Boolean. Indica si el usuario es encargado del eje.
 */
const validateResponsible = async ({ idUser, idActivity, preventError = false }) => {
  const activity = await ActivitySchema.findOne({
    _id: idActivity,
    responsible: { $elemMatch: { _id: idUser } },
  });
  const isResponsible = !!activity; // Esto será true si la actividad fue encontrada
  if (!isResponsible && !preventError) {
    throw new CustomError('El usuario no es encargado de la actividad.', 403);
  }
  return isResponsible;
};

const createActivity = async ({
  name,
  date,
  serviceHours,
  responsible,
  idAsigboArea,
  registrationStartDate,
  registrationEndDate,
  participatingPromotions,
  participantsNumber,
  registrationAvailable,
  description,
  hasBanner,
  session,
}) => {
  // obtener datos de area asigbo
  const asigboAreaData = await AsigboAreaSchema.findOne({ _id: idAsigboArea });

  if (asigboAreaData === null) throw new CustomError('No existe el área de asigbo.', 400);

  // obtener datos de encargados
  const responsiblesData = await UserSchema.find({ _id: { $in: responsible } });

  if (responsiblesData === null || responsiblesData.length === 0) {
    throw new CustomError('No se encontraron usuarios válidos como encargados.', 400);
  }
  if (responsiblesData.length !== responsible.length) {
    throw new CustomError('Alguno de los encargados seleccionados no existen.', 400);
  }

  // guardar actividad
  const activity = new ActivitySchema();
  activity.name = name?.trim();
  activity.date = getUTCDate(date);
  activity.serviceHours = serviceHours;
  activity.responsible = responsiblesData;
  activity.asigboArea = asigboAreaData;
  activity.registrationStartDate = getUTCDate(registrationStartDate);
  activity.registrationEndDate = getUTCDate(registrationEndDate);
  activity.participatingPromotions = participatingPromotions?.length > 0 ? participatingPromotions : null;
  activity.maxParticipants = participantsNumber;
  activity.description = description?.trim();
  activity.hasBanner = hasBanner;
  activity.registrationAvailable = registrationAvailable;

  const result = await activity.save({ session });
  return singleActivityDto(result);
};

/**
 * Actualiza la información de una actividad.
 * @returns updatedData Objeto con la data actualizada.
 * @returns dataBeforeChange Objeto con la data previa a la actualización.
 */
const updateActivity = async ({
  session,
  id,
  name,
  date,
  serviceHours,
  responsible,
  idPayment,
  registrationStartDate,
  registrationEndDate,
  participatingPromotions,
  maxParticipantsNumber,
  registrationAvailable,
  hasBanner,
  description,
}) => {
  try {
    // obtener actividad
    const activity = await ActivitySchema.findOne({ _id: id, blocked: false });
    if (activity === null) throw new CustomError('No existe la actividad a actualizar.', 400);

    const dataBeforeChange = singleActivityDto(activity, { showSensitiveData: true });

    // obtener datos de encargados
    const responsiblesData = await UserSchema.find({ _id: { $in: responsible } });

    if (responsible !== undefined && (responsiblesData === null || responsiblesData.length === 0)) {
      throw new CustomError('No se encontraron usuarios válidos como encargados.', 400);
    }
    if (responsible !== undefined && responsiblesData.length !== responsible.length) {
      throw new CustomError('Alguno de los encargados seleccionados no existen.', 400);
    }

    // actualizar actividad

    if (name !== undefined) activity.name = name?.trim();
    if (date !== undefined) activity.date = getUTCDate(date);
    if (serviceHours !== undefined) activity.serviceHours = serviceHours;
    if (responsible !== undefined) activity.responsible = responsiblesData;
    if (idPayment !== undefined) activity.payment = idPayment;

    if (participatingPromotions !== undefined) {
      activity.participatingPromotions = participatingPromotions?.length > 0 ? participatingPromotions : null;
    }
    if (exists(hasBanner)) activity.hasBanner = hasBanner;
    if (exists(description)) activity.description = description?.trim();
    if (exists(registrationAvailable)) activity.registrationAvailable = registrationAvailable;
    if (exists(maxParticipantsNumber)) {
      if (maxParticipantsNumber >= activity.participantsNumber) {
        activity.maxParticipants = maxParticipantsNumber;
      } else {
        throw new CustomError(
          `El nuevo número máximo de participantes es menor al número de becados que se encuentran ya inscritos (${
            activity.participantsNumber
          } ${activity.participantsNumber > 1 ? 'inscripciones' : 'inscripción'}).`,
          400,
        );
      }
    }

    if (exists(registrationStartDate)) {
      const utcDate = getUTCDate(registrationStartDate);
      activity.registrationStartDate = utcDate;
    }
    if (exists(registrationEndDate)) {
      const utcDate = getUTCDate(registrationEndDate);
      activity.registrationEndDate = utcDate;
    }

    const result = await activity.save({ session });
    return {
      updatedData: singleActivityDto(result, { showSensitiveData: true }),
      dataBeforeChange,
    };
  } catch (ex) {
    if (ex?.kind === 'ObjectId') throw new CustomError('Se proporcionó un id inválido.', 400);
    throw ex;
  }
};

const updateActivityInAllAssignments = async ({ activity, session }) => ActivityAssignmentSchema.updateMany({ 'activity._id': activity.id }, { activity }, { session });

const deleteActivity = async ({ idActivity, session }) => {
  try {
    const { deletedCount } = await ActivitySchema.deleteOne({ _id: idActivity }, { session });

    if (deletedCount === 0) throw new CustomError('No se encontró la actividad a eliminar.', 404);
  } catch (ex) {
    if (ex?.kind === 'ObjectId') throw new CustomError('El id de la actividad no es válido.');
    throw ex;
  }
};

const getActivities = async ({
  idAsigboArea = null,
  search = null,
  lowerDate = null,
  upperDate = null,
  page = null,
  throwNotFoundError = true,
  sort = false,
  session,
}) => {
  const query = {};

  if (exists(idAsigboArea)) query['asigboArea._id'] = idAsigboArea;
  if (someExists(lowerDate, upperDate)) query.date = {};
  if (exists(lowerDate)) query.date.$gte = getUTCDate(lowerDate);
  if (exists(upperDate)) query.date.$lte = getUTCDate(upperDate);
  if (exists(search)) {
    // buscar cadena en nombre de la actividad
    const searchRegex = new RegExp(getSearchRegex(search), 'i');
    query.name = { $regex: searchRegex };
  }

  const options = {};
  if (exists(page)) {
    options.skip = page * consts.resultsNumberPerPage;
    options.limit = consts.resultsNumberPerPage;
  }

  try {
    let activityPromise = ActivitySchema.find(query, null, options).session(session);
    if (sort) activityPromise = activityPromise.sort({ date: -1, _id: -1 });

    const result = await activityPromise;

    if (result.length === 0) {
      if (!throwNotFoundError) return null;
      throw new CustomError('No se encontraron resultados.', 404);
    }

    return multipleActivityDto(result);
  } catch (ex) {
    if (ex?.kind === 'ObjectId') throw new CustomError('El id del área de asigbo no es válido.');
    if (ex?.kind === 'date') throw new CustomError('La fecha máxima no es una fecha válida.');
    throw ex;
  }
};

/**
 * Permite obtener una actividad por Id.
 * Lanza una excepción CustomError si no encuentra resultados.
 * @param idActivity Id de la actividad.
 * @param showSensitiveData Boolean. Default false. Indica si se muestran los datos sensibles de la actividad.
 * @returns Activity dto. Retorna null si no existe.
 */
const getActivity = async ({ idActivity, showSensitiveData = false }) => {
  try {
    const result = await ActivitySchema.findById(idActivity);

    if (result === null) return null;

    return singleActivityDto(result, { showSensitiveData });
  } catch (ex) {
    if (ex?.kind === 'ObjectId') throw new CustomError('El id de la actividad no es válido.', 400);
    throw ex;
  }
};
const getActivityByNameAndArea = async ({ name, idArea, session }) => {
  const result = await ActivitySchema.findOne({ name, 'asigboArea._id': new ObjectId(idArea) }).session(session);

  return result ? result.id : null;
};

const getActivitiesWhereUserIsResponsible = async ({
  idUser,
  search = null,
  lowerDate = null,
  upperDate = null,
  page = null,
  sort = false,
  session,
}) => {
  const query = { responsible: { $elemMatch: { _id: idUser } } };

  if (someExists(lowerDate, upperDate)) query.date = {};
  if (exists(lowerDate)) query.date.$gte = getUTCDate(lowerDate);
  if (exists(upperDate)) query.date.$lte = getUTCDate(upperDate);
  if (exists(search)) {
    // buscar cadena en nombre de la actividad
    const searchRegex = new RegExp(search, 'i');
    query.name = { $regex: searchRegex };
  }

  const options = {};
  if (exists(page)) {
    options.skip = page * consts.resultsNumberPerPage;
    options.limit = consts.resultsNumberPerPage;
  }

  const activityPromise = ActivitySchema.find(query, null, options).session(session);
  if (sort) activityPromise.sort({ date: -1, _id: -1 });
  const results = await activityPromise;

  if (results.length === 0) return null;

  return multipleActivityDto(results);
};

/**
 * Permite sumar una cantidad al valor de número de participantes de una actividad. Para disminuir,
 * simplemente utilizar con valores negativos.
 * @param idActivity Id de la actividad.
 * @param value Number. Valor numérico a incrementar. Un valor negativo decrementa.
 * @param session Object. Objecto de la sesión mongodb.
 */
const addActivityParticipants = async ({ idActivity, value, session }) => {
  try {
    const { acknowledged, matchedCount, modifiedCount } = await ActivitySchema.updateOne(
      { _id: idActivity },
      { $inc: { participantsNumber: value } },
      { session },
    );

    if (matchedCount === 0) throw new CustomError('No se encontró la actividad.', 404);
    if (!acknowledged || !modifiedCount) { throw new CustomError('No fue posible actualizar el número de participantes.', 500); }
  } catch (ex) {
    if (ex?.kind === 'ObjectId') throw new CustomError('El id de la actividad no es válido.', 400);
    throw ex;
  }
};

const updateActivityBlockedStatus = async ({ idActivity, blocked, session }) => {
  try {
    // actualiza y retorna la data nueva
    const activity = await ActivitySchema.findOneAndUpdate(
      { _id: idActivity },
      { blocked },
      { new: true, session },
    );

    if (!activity) throw new CustomError('No se encontró la actividad.', 404);
    return singleActivityDto(activity, { showSensitiveData: true });
  } catch (ex) {
    if (ex?.kind === 'ObjectId') throw new CustomError('El id de la actividad no es válido.');
    throw ex;
  }
};

const uploadActivities = async ({ activities, session }) => {
  if (!activities || activities.length === 0) throw new CustomError('Debe enviar por lo menos un registro.', 400);
  const savedActivities = await ActivitySchema.insertMany(activities, { session });
  return savedActivities;
};

const getActivityByPaymentId = async ({ idPayment, session }) => {
  const activity = await ActivitySchema.findOne({ 'payment._id': idPayment }).session(session);

  return activity ? singleActivityDto(activity) : null;
};

const assignPaymentToActivity = async ({ idActivity, payment, session }) => {
  const activity = await ActivitySchema.findById(idActivity).session(session);

  if (!activity) throw new CustomError('No se encontró la actividad.', 404);

  if (exists(activity.payment)) throw new CustomError('La actividad ya cuenta con un pago asignado.', 400);

  activity.payment = payment;

  await activity.save();
};

/**
 * Obtener las actividades en las que se puede asignar.
 * @param promotionYear Number. Año de promoción del usuario.
 * @param promotionGroup String. Grupo de promoción del usuario.
 * @param activitiesToIgnore [ObjectId] Lista de actividades que se ignorarán. Idealmente es para
 * omitir actividades en las que el usuario ya está inscrito.
 * @param lowerDate Date. Limite inferior para filtrar fecha (opcional)
 * @param upperDate Date. Limite superior para filtar por fecha (opcional)
 * @param search subcadena a buscar en el nombre de la actividad.
 * @returns Multiple Activity Dtos
 */
const getAvailableActivitiesToParticipate = async ({
  promotionYear, promotionGroup, activitiesToIgnore, lowerDate, upperDate, search,
}) => {
  const currentDate = getUTCDate(new Date());
  const query = {
    $or: [
      { participatingPromotions: null },
      { participatingPromotions: { $in: [promotionYear, promotionGroup] } },
    ],
    registrationAvailable: true,
    blocked: false,
    _id: { $nin: activitiesToIgnore },
    registrationStartDate: { $lte: currentDate },
    registrationEndDate: { $gte: currentDate },
  };
  if (someExists(lowerDate, upperDate)) query.date = {};
  if (exists(lowerDate)) query.date.$gte = getUTCDate(lowerDate);
  if (exists(upperDate)) query.date.$lte = getUTCDate(upperDate);
  if (exists(search)) {
    // buscar cadena en nombre de la actividad
    const searchRegex = new RegExp(getSearchRegex(search), 'i');
    query.name = { $regex: searchRegex };
  }

  const activities = await ActivitySchema.find(query).sort({ date: 1 });
  if (activities.length === 0) return null;
  return multipleActivityDto(activities);
};

export {
  createActivity,
  updateActivity,
  updateActivityInAllAssignments,
  deleteActivity,
  getActivities,
  getActivity,
  getActivitiesWhereUserIsResponsible,
  validateResponsible,
  addActivityParticipants,
  updateActivityBlockedStatus,
  getActivityByNameAndArea,
  uploadActivities,
  getActivityByPaymentId,
  assignPaymentToActivity,
  getAvailableActivitiesToParticipate,
};

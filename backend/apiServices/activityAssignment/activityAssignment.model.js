import ActivityAssignmentSchema from '../../db/schemas/activityAssignment.schema.js';
import consts from '../../utils/consts.js';
import CustomError from '../../utils/customError.js';
import exists, { someExists } from '../../utils/exists.js';
import Promotion from '../promotion/promotion.model.js';
import { multiple as multipleAssignmentActivityDto, single as singleAssignmentActivityDto } from './activityAssignment.dto.js';
import { single as singleUserDto } from '../user/user.dto.js';
import getUTCDate from '../../utils/getUTCDate.js';
import getSearchRegex from '../../utils/getSearchRegex.js';

/**
 * Permite obtener las asignaciones de una actividad.
 * @param idUser Filtro para obtener asignaciones de un usuario. (Opcional)
 * @param idActivity Filtro para obtener asignaciones de una actividad. (Opcional)
 * @param search Cadena a buscar en el nombre de la actividad asignada. (Opcional)
 * @param lowerDate Límite inferior en la fecha de la actividad asignada. (Opcional)
 * @param upperDate Límite superior en la fecha de la actividad asignada. (Opcional)
 * @param page Pagina a consultar. Inicia en cero. Si es null devuelve el listado completo.
 * @param includeUserPromotionGroup Boolean. Indica si se debe agregar el grupo de promoción del usuario.
 * @param showSensitiveData Boolean. Indica si se debe mostrar la información sensible.
 * @returns Multiple AssignmentDto con grupo de promoción de usuario. Null si no hay resultados.
 */
const getActivityAssignments = async ({
  idUser, idActivity,
  search = null,
  lowerDate = null,
  upperDate = null,
  page = null,
  includeUserPromotionGroup = true,
  showSensitiveData = false,
}) => {
  try {
    const query = {};

    if (exists(idUser)) query['user._id'] = idUser;
    if (exists(idActivity)) query['activity._id'] = idActivity;
    if (someExists(lowerDate, upperDate)) query['activity.date'] = {};
    if (exists(lowerDate)) query['activity.date'].$gte = getUTCDate(lowerDate);
    if (exists(upperDate)) query['activity.date'].$lte = getUTCDate(upperDate);
    if (exists(search)) {
      // buscar cadena en nombre de la actividad
      const searchRegex = new RegExp(getSearchRegex(search), 'i');
      query['activity.name'] = { $regex: searchRegex };
    }

    const options = {};
    if (exists(page)) {
      options.skip = page * consts.resultsNumberPerPage;
      options.limit = consts.resultsNumberPerPage;
    }

    const assignments = await ActivityAssignmentSchema.find(query, null, options).sort({
      'activity.date': -1,
      completed: -1,
      'paymentAssignment.confirmed': -1,
      'paymentAssignment.completed': -1,
    });
    if (assignments.length === 0) return null;

    const parsedAssignments = multipleAssignmentActivityDto(assignments, { showSensitiveData });

    if (!includeUserPromotionGroup) return parsedAssignments;
    const promotion = new Promotion();

    return await Promise.all(
      parsedAssignments.map(async (assignment) => {
        // Agregar grupo de promoción al usuario
        const copy = assignment;
        copy.user.promotionGroup = await promotion.getPromotionGroup(assignment.user.promotion);
        return copy;
      }),
    );
  } catch (ex) {
    if (ex?.kind === 'ObjectId') {
      throw new CustomError('Los ids proporcionados no son válidos.', 400);
    }
    throw ex;
  }
};

/**
 * Permite buscar una asignación de actividad por id de usuario y actividad.
 * @returns ActivityAssignmentDto. Null si no se encuentra la asignación.
 */
const getActivityAssignment = async ({
  idUser, idActivity, session, showSensitiveData = false,
}) => {
  try {
    const assignments = await ActivityAssignmentSchema
      .find({ 'user._id': idUser, 'activity._id': idActivity })
      .session(session);

    if (assignments.length === 0) return null;

    const assignment = singleAssignmentActivityDto(assignments[0], { showSensitiveData });
    return assignment;
  } catch (ex) {
    if (ex?.kind === 'ObjectId') {
      throw new CustomError('Los ids proporcionados no son válidos.', 400);
    }
    throw ex;
  }
};

const assignUserToActivity = async ({
  user, completed, activity, paymentAssignment, session, aditionalServiceHours = 0,
}) => {
  try {
    const activityAssignment = new ActivityAssignmentSchema();

    activityAssignment.user = user;
    activityAssignment.activity = activity;
    activityAssignment.paymentAssignment = paymentAssignment;
    activityAssignment.completed = completed ?? false;
    activityAssignment.aditionalServiceHours = aditionalServiceHours;

    await activityAssignment.save({ session });
  } catch (ex) {
    if (ex?.code === 11000) {
      // indice duplicado
      throw new CustomError('El usuario ya se encuentra inscrito en la actividad.', 400);
    }
    throw ex;
  }
};

const getCompletedActivityAssignmentsById = async (id) => ActivityAssignmentSchema.find({ 'activity._id': id, completed: true });

const unassignUserFromActivity = async ({ idActivity, idUser, session }) => {
  const assignmentData = await ActivityAssignmentSchema.findOneAndDelete(
    { 'user._id': idUser, 'activity._id': idActivity },
    { session },
  );

  if (!assignmentData) {
    throw new CustomError('El usuario no se encuentra inscrito en la actividad.', 403);
  }
  if (assignmentData.completed) {
    throw new CustomError('No se puede desasignar a un usuario cuya participación fue completada.', 400);
  }

  return singleAssignmentActivityDto(assignmentData);
};

/**
 * Permite modificar el estado de completado de la asignación a la actividad.
 * @param {idUser, idActivity, completed, session}
 * @param {array} filesToSave. Array de objetos {name, fileKey}
 * @param {array} filesKeyToRemove. Array de strings con los keys de los archivos a eliminar.
 * @throws CustomError si la asignación no existe.
 * @returns ActivityAssignment object. Datos de la asignación previo a la modificación.
 */
const updateActivityAssignment = async ({
  idUser, idActivity, completed, aditionalServiceHours, notes, filesToSave, filesToRemove, session,
}) => {
  const updateOperations = [];

  // Agregar otras actualizaciones a la pipeline
  if (exists(completed)) {
    updateOperations.push({ $set: { completed } });
  }
  if (exists(aditionalServiceHours)) {
    updateOperations.push({ $set: { aditionalServiceHours } });
  }
  if (exists(notes)) {
    updateOperations.push({ $set: { notes } });
  }

  // Agregar archivos para eliminar y luego agregar en la misma pipeline
  if (exists(filesToRemove)) {
    updateOperations.push({
      $set: { files: { $filter: { input: '$files', as: 'file', cond: { $not: { $in: ['$$file', filesToRemove] } } } } },
    });
  }
  if (exists(filesToSave)) {
    updateOperations.push({
      $set: {
        files: {
          $cond: {
            if: { $isArray: '$files' },
            then: { $concatArrays: ['$files', filesToSave] },
            else: filesToSave,
          },
        },
      },
    });
  }

  const assignmentData = await ActivityAssignmentSchema.findOneAndUpdate(
    { 'user._id': idUser, 'activity._id': idActivity },
    updateOperations,
    { session },
  );

  if (assignmentData === null) {
    throw new CustomError('El usuario no se encuentra inscrito en la actividad.', 404);
  }

  return singleAssignmentActivityDto(assignmentData);
};

/**
 * Obtener el listado de usuario asignados a una actividad.
 * @param idActivity
 * @param session
 * @returns UserDto array
 */
const getActivityAssignedUsers = async ({ idActivity, session }) => {
  const assignments = await ActivityAssignmentSchema.find({ 'activity._id': idActivity }, { user: 1 }).session(session);
  return assignments.map((result) => singleUserDto(result.user));
};

/**
 * Añade el subdocumento de asignación de pago en la correspondiente asignación a la actividad
 * para múltiples usuarios.
 * @param idActivity
 * @param paymentAssignmentsList Lista de paymentAssignments
 * @param session
 */
const addPaymentsToActivityAssignments = async ({ idActivity, paymentAssignmentsList, session }) => {
  const bulkOptions = [];

  paymentAssignmentsList.forEach((paymentAssignment) => {
    const updateOptions = {
      updateOne: {
        filter: { 'activity._id': idActivity, 'user._id': paymentAssignment.user._id },
        update: { $set: { paymentAssignment } },
        upsert: false,
      },
    };
    bulkOptions.push(updateOptions);
  });

  const { matchedCount } = await ActivityAssignmentSchema.bulkWrite(bulkOptions, { session });

  if (matchedCount !== paymentAssignmentsList.length) throw new CustomError('No se encontraron algunas asignaciones a actividades.', 404);
};

/**
 * Retorna las asignaciones de un usuario
 * @param idUser ObjectId. Id del usuario a consultar
 * @param lowerDate Date. Limite inferior para filtrar fecha (opcional)
 * @param upperDate Date. Limite superior para filtar por fecha (opcional)
 * @param search subcadena a buscar en el nombre de la actividad.
 * @param notCompletedOnly Boolean. Devuelve solo las asignaciones que no han sido completadas aún.
 */
const getUserActivityAssignments = async ({
  idUser, lowerDate, upperDate, search, notCompletedOnly = false,
}) => {
  const query = { 'user._id': idUser };

  // Agregar filtros por fecha
  if (someExists(lowerDate, upperDate)) {
    query['activity.date'] = {};

    if (exists(lowerDate)) query['activity.date'].$gte = getUTCDate(lowerDate);
    if (exists(upperDate)) query['activity.date'].$lte = getUTCDate(upperDate);
  }
  if (exists(search)) {
    // buscar cadena en nombre de la actividad
    const searchRegex = new RegExp(getSearchRegex(search), 'i');
    query['activity.name'] = { $regex: searchRegex };
  }

  // Filtrar solo actividades no completadas (si corresponde)
  if (notCompletedOnly) {
    query.completed = false;
  }

  const assignments = await ActivityAssignmentSchema.find(query).sort({ 'activity.date': 1 });
  if (assignments.length === 0) return null;
  return multipleAssignmentActivityDto(assignments);
};

const verifyIfUserIsAssignedToAnyActivity = async ({ idUser, session }) => {
  const assignments = await ActivityAssignmentSchema.find({ 'user._id': idUser }).session(session);
  return assignments.length > 0;
};

export {
  assignUserToActivity,
  getCompletedActivityAssignmentsById,
  getActivityAssignments,
  unassignUserFromActivity,
  updateActivityAssignment,
  getActivityAssignment,
  addPaymentsToActivityAssignments,
  getActivityAssignedUsers,
  getUserActivityAssignments,
  verifyIfUserIsAssignedToAnyActivity,
};

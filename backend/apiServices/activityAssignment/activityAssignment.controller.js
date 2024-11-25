import fs from 'node:fs';
import { connection } from '../../db/connection.js';
import uploadFileToBucket from '../../services/cloudStorage/uploadFileToBucket.js';
import consts from '../../utils/consts.js';
import CustomError from '../../utils/customError.js';
import errorSender from '../../utils/errorSender.js';
import exists from '../../utils/exists.js';
import getUTCDate from '../../utils/getUTCDate.js';
import parseBoolean from '../../utils/parseBoolean.js';
import {
  addActivityParticipants,
  getActivity,
  validateResponsible as validateActivityResponsible,
} from '../activity/activity.model.js';
import { validateResponsible as validateAreaResponsible } from '../asigboArea/asigboArea.model.js';
import {
  assignPaymentToUser, deletePaymentAssignment,
  verifyIfUserIsTreasurer,
} from '../payment/payment.model.js';
import Promotion from '../promotion/promotion.model.js';
import {
  getUser,
  updateActivitiesCompletedNumber,
  updateServiceHours,
} from '../user/user.model.js';
import {
  assignUserToActivity,
  getActivityAssignment,
  getActivityAssignments,
  getUserActivityAssignments,
  unassignUserFromActivity,
  updateActivityAssignment,
} from './activityAssignment.model.js';
import writeLog from '../../utils/writeLog.js';
import deleteFileInBucket from '../../services/cloudStorage/deleteFileInBucket.js';

const validateActivityResponsibleAccess = async ({
  role, idUser, idArea, idActivity,
}) => {
  if (role.includes(consts.roles.admin)) return true;
  if (role.includes(consts.roles.asigboAreaResponsible)) {
    const hasAccess = await validateAreaResponsible({ idUser, idArea, preventError: true });
    if (hasAccess) return true;
  }
  if (role.includes(consts.roles.activityResponsible)) {
    const hasAccess = await validateActivityResponsible({ idUser, idActivity, preventError: true });
    if (hasAccess) return true;
  }

  return false;
};

const getActivitiesAssigmentsController = async (req, res) => {
  const {
    idUser, search, lowerDate, upperDate, page,
  } = req.query;
  const { id: sessionUserId, role } = req.session;

  // Si no es  admin, busca solo asignaciones del usuario
  const idUserFilter = role.includes(consts.roles.admin) ? idUser : sessionUserId;
  try {
    let pagesNumber = null;
    if (exists(page)) {
      // Obtener número total de resultados si se selecciona página
      const completeResult = await getActivityAssignments({
        idUser: idUserFilter,
        search,
        lowerDate,
        upperDate,
      });
      if (completeResult === null) {
        throw new CustomError('No se encontraron resultados de asignaciones.', 404);
      }
      pagesNumber = completeResult.length;
    }

    const result = await getActivityAssignments({
      idUser: idUserFilter,
      search,
      lowerDate,
      upperDate,
      page,
    });

    if (!result) {
      throw new CustomError('No se encontraron resultados de asignaciones.', 404);
    }

    res.send({
      pages: Math.ceil((pagesNumber ?? result.length) / consts.resultsNumberPerPage),
      resultsPerPage: consts.resultsNumberPerPage,
      result,
    });
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al obtener las asignaciones a actividades.',
    });
  }
};

const getActivitiesAssigmentsByActivityController = async (req, res) => {
  const { idActivity } = req.params;
  try {
    const activityAssignments = await getActivityAssignments({ idActivity });
    if (!activityAssignments) {
      throw new CustomError('No se encontraron resultados de asignaciones.', 404);
    }
    res.send(activityAssignments);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al obtener las asignaciones de la actividad.',
    });
  }
};

const getActivityAssigmentController = async (req, res) => {
  const { idActivity, idUser } = req.params;
  const { role, id: sessionIdUser } = req.session;
  try {
    const activities = await getActivityAssignments({ idActivity, idUser, showSensitiveData: true });

    if (!activities) {
      throw new CustomError('No se encontraron resultados.', 404);
    }

    const activityAssignment = activities[0];

    // Verificar permisos para acceder a información
    const isResponsible = await validateActivityResponsibleAccess({
      role,
      idUser: sessionIdUser,
      idActivity,
      idArea: activityAssignment.activity.asigboArea.id,
    });

    if (!isResponsible) {
      throw new CustomError('El usuario no figura como encargado de esta actividad ni del área al que pertenece.', 403);
    }

    if (activityAssignment.paymentAssignment) {
      // Verificar si el usuario actual es tesorero
      const { idPayment } = activityAssignment.paymentAssignment;
      activityAssignment.paymentAssignment.isTreasurer = await verifyIfUserIsTreasurer({
        idPayment,
        idUser: req.session.id,
      });
    }

    res.send(activityAssignment);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al obtener la asignación de la actividad.',
    });
  }
};

const getLoggedActivitiesController = async (req, res) => {
  try {
    const activities = await getActivityAssignments({ idUser: req.session.id });
    if (!activities) {
      throw new CustomError('No se encontraron resultados.', 404);
    }
    res.send(activities);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al obtener las actividades del usuario.',
    });
  }
};

const assignUserToActivityController = async (req, res) => {
  const { idUser: paramIdUser, idActivity } = req.params;
  const { completed } = req.body;
  const { role, id: sessionIdUser } = req.session;

  // Asignar a usuario en sesión si no se proporciona parámetro
  const idUser = paramIdUser ?? sessionIdUser;

  const session = await connection.startSession();
  try {
    session.startTransaction();

    const activity = await getActivity({ idActivity, showSensitiveData: true });

    if (!activity) throw new CustomError('No se encontró la actividad.', 404);

    const isCurrentUser = idUser === sessionIdUser;
    const isResponsible = await validateActivityResponsibleAccess({
      role,
      idUser: sessionIdUser,
      idActivity,
      idArea: activity.asigboArea.id,
    });

    // Validar acceso
    if (!isCurrentUser && !isResponsible) {
      throw new CustomError(
        'El usuario no figura como encargado de esta actividad ni del área al que pertenece.',
        403,
      );
    }

    // Validar que la actividad y eje estén habilitados
    if (activity.asigboArea.blocked) {
      throw new CustomError('El eje de ASIGBO correspondiente se encuentra bloqueado.', 409);
    }
    if (activity.blocked) {
      throw new CustomError('La actividad se encuentra deshabilitada.', 409);
    }

    if (!activity.registrationAvailable && !isResponsible) {
      throw new CustomError('La inscripción de becados a esta actividad está deshabilitada.', 400);
    }

    const user = await getUser({ idUser, showSensitiveData: true });
    if (!user) throw new CustomError('El usuario indicado no existe.', 404);

    // validar que la promoción esté incluida
    // Si es "engargado" puede asignar usuarios fuera de los grupos asignados
    if (!isResponsible) {
      const promotionObj = new Promotion();
      const userPromotionGroup = await promotionObj.getPromotionGroup(user.promotion);

      if (
        activity.participatingPromotions !== null
      && !activity.participatingPromotions.includes(user.promotion)
      && !activity.participatingPromotions.includes(userPromotionGroup)
      ) {
        throw new CustomError('La actividad no está disponible para la promoción del usuario.', 403);
      }
    }

    // Verificar que la fecha de inscripción esté en el rango disponible
    if (!isResponsible) {
      const currentDate = getUTCDate();
      const registrationStartDate = new Date(activity.registrationStartDate);
      const registrationEndDate = new Date(activity.registrationEndDate);

      if (currentDate < registrationStartDate || currentDate > registrationEndDate) {
        throw new CustomError('La actividad ya no se encuentra disponible.', 400);
      }
    }

    // verificar que hayan espacios disponibles
    if (activity.participantsNumber >= activity.maxParticipants) {
      throw new CustomError('La actividad no cuenta con suficientes espacios disponibles.', 403);
    }

    // Asignar pago a usuario (si corresponde)
    let paymentAssignment = null;
    if (activity.payment) {
      paymentAssignment = await assignPaymentToUser({ user, payment: activity.payment, session });
    }

    await assignUserToActivity({
      user,
      completed,
      activity,
      paymentAssignment,
      session,
    });

    // Añadir un participante
    await addActivityParticipants({ idActivity, value: 1, session });

    await session.commitTransaction();

    res.status(204).send({ ok: true });
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al asignar usuarios a una actividad.', session,
    });
  } finally {
    session.endSession();
  }
};

const unassignUserFromActivityController = async (req, res) => {
  const { idActivity, idUser } = req.params;
  const { role, id: sessionIdUser } = req.session;

  const session = await connection.startSession();

  try {
    session.startTransaction();

    const activity = await getActivity({ idActivity, showSensitiveData: true });

    if (!activity) throw new CustomError('No se encontró la actividad.', 404);

    // Validar acceso
    const isResponsible = await validateActivityResponsibleAccess({
      role,
      idUser: sessionIdUser,
      idActivity,
      idArea: activity.asigboArea.id,
    });
    if (!isResponsible) {
      throw new CustomError(
        'El usuario no figura como encargado de esta actividad ni del área al que pertenece.',
        403,
      );
    }

    // Validar que la actividad y eje estén habilitados
    if (activity.asigboArea.blocked) {
      throw new CustomError('El eje de ASIGBO correspondiente se encuentra bloqueado.', 409);
    }
    if (activity.blocked) {
      throw new CustomError('La actividad se encuentra deshabilitada.', 409);
    }

    await unassignUserFromActivity({ idActivity, idUser, session });

    // Remover participantes en la actividad
    await addActivityParticipants({ idActivity, value: -1, session });

    // Si existe un pago en la actividad, eliminar asignación (si no fue completado el pago aún)
    if (activity.payment) {
      await deletePaymentAssignment({ idUser, idPayment: activity.payment.id, session });
    }

    await session.commitTransaction();

    res.status(204).send({ ok: true });
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al desasignar al usuario de la actividad.', session,
    });
  } finally {
    session.endSession();
  }
};

const saveAssignmentFile = async ({ fileName, type }) => {
  const filePath = `${global.dirname}/files/${fileName}`;

  // subir archivos

  const fileKey = `${consts.bucketRoutes.assignment}/${fileName}`;

  try {
    await uploadFileToBucket(fileKey, filePath, type);
  } catch (ex) {
    writeLog(2, 'Error al subir archivo a bucket:', ex);
    throw new CustomError('No se pudo cargar el archivo de asignación.', 500);
  }
};

const updateActivityAssignmentController = async (req, res) => {
  const { idActivity, idUser } = req.params;
  const {
    completed, aditionalServiceHours, notes, filesToRemove,
  } = req.body;
  const { role, id: sessionIdUser } = req.session;
  const filesToSave = [];

  const session = await connection.startSession();

  try {
    session.startTransaction();
    const activity = await getActivity({ idActivity, showSensitiveData: true });

    if (!activity) throw new CustomError('No se encontró la actividad.', 404);

    // Validar acceso
    const isResponsible = await validateActivityResponsibleAccess({
      role,
      idUser: sessionIdUser,
      idActivity,
      idArea: activity.asigboArea.id,
    });
    if (!isResponsible) {
      throw new CustomError(
        'El usuario no figura como encargado de esta actividad ni del área al que pertenece.',
        403,
      );
    }

    // Validar que la actividad y eje estén habilitados
    if (activity.asigboArea.blocked) {
      throw new CustomError('El eje de ASIGBO correspondiente se encuentra bloqueado.', 409);
    }
    if (activity.blocked) {
      throw new CustomError('La actividad se encuentra deshabilitada.', 409);
    }

    // Subir archivos a storage
    if (req.uploadedFiles?.length > 0) {
      await Promise.all(req.uploadedFiles.map(async (file) => {
        const { fileName, type } = file;
        await saveAssignmentFile({ fileName, type });
        filesToSave.push(fileName);
      }));
    }

    const assignmentPrevUpdate = await updateActivityAssignment({
      idUser,
      idActivity,
      completed,
      aditionalServiceHours,
      notes,
      filesToRemove,
      filesToSave,
      session,
    });

    // Si se subieron nuevos files, validar que no excedan el límite de 5
    if (filesToSave.length > 0) {
      // Buscar documento actualizado
      const updatedAssignment = await getActivityAssignment({
        idUser, idActivity, session, showSensitiveData: true,
      });
      if (updatedAssignment?.files?.length > 5) {
        throw new CustomError('No se pueden subir más de 5 archivos por asignación.', 400);
      }
    }

    // Valores de asignación previos a la modificación
    const {
      activity: {
        serviceHours,
        asigboArea: { _id: asigboAreaId },
      },
      completed: prevCompletedResultValue,
      aditionalServiceHours: prevAditionalServiceHours,
    } = assignmentPrevUpdate;

    const parsedAditionalServiceHours = exists(aditionalServiceHours)
      ? parseInt(aditionalServiceHours, 10)
      : null;

    if (exists(aditionalServiceHours) && !exists(completed) && prevCompletedResultValue) {
      // Realizar unicamente ajuste de horas adicionales para actividad completada
      const hoursToAdd = parsedAditionalServiceHours - (prevAditionalServiceHours ?? 0);
      if (hoursToAdd !== 0) {
        // Valores negativos restan al total
        await updateServiceHours({
          userId: idUser,
          asigboAreaId,
          hoursToAdd,
          session,
        });
      }
    } else if (exists(completed) && prevCompletedResultValue !== parseBoolean(completed)) {
      // Se modificó el valor completed
      if (parseBoolean(completed)) {
        // agregar horas + horas adicionales (si también se modificaron, utilizar valor nuevo)
        const hoursToAdd = serviceHours + (parsedAditionalServiceHours ?? prevAditionalServiceHours ?? 0);
        if (hoursToAdd > 0) {
          await updateServiceHours({
            userId: idUser,
            asigboAreaId,
            hoursToAdd,
            session,
          });
        }

        // Aumentar en 1 la cantidad de activ. completadas
        await updateActivitiesCompletedNumber({ idUser, add: 1, session });
      } else {
        // remover horas + horas adicionales previas (sin importar que se haya actualizado)
        const hoursToRemove = serviceHours + (prevAditionalServiceHours ?? 0);
        if (hoursToRemove > 0) {
          await updateServiceHours({
            userId: idUser,
            asigboAreaId,
            hoursToRemove,
            session,
          });
        }

        // Reducir en 1 la cantidad de activ. completadas
        await updateActivitiesCompletedNumber({ idUser, remove: 1, session });
      }
    }

    // Eliminar archivos de storage
    if (filesToRemove?.length > 0) {
      try {
        await Promise.all(filesToRemove?.map(async (fileName) => deleteFileInBucket(`${consts.bucketRoutes.assignment}/${fileName}`)));
      } catch (err) {
      // Error no crítico
        writeLog(2, 'Error al eliminar archivos en bucket: ', err);
      }
    }

    await session.commitTransaction();

    res.status(200).send({ filesSaved: filesToSave });

    session.endSession();
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al actualizar la asignación de la actividad.', session,
    });

    session.endSession();

    // Si ocurrió un error, eliminar archivos cargados
    filesToSave?.map((fileName) => deleteFileInBucket(`${consts.bucketRoutes.assignment}/${fileName}`)
      .catch((err) => writeLog(2, 'Error al eliminar archivos en bucket: ', err)));
  } finally {
    // eliminar archivos temporales
    req.uploadedFiles?.forEach(({ fileName }) => {
      const filePath = `${global.dirname}/files/${fileName}`;
      fs.unlink(filePath, (err) => {
        if (err) writeLog(2, 'Error al eliminar archivo temporal:', err);
      });
    });
  }
};

const getUserNotCompletedAssignmentsController = async (req, res) => {
  const { id: idUser } = req.session;
  const { lowerDate, upperDate, search } = req.query;
  try {
    const assignments = await getUserActivityAssignments({
      idUser, lowerDate, upperDate, search, notCompletedOnly: true,
    });
    if (!assignments) throw new CustomError('No se encontraron resultados.', 404);
    res.send(assignments);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrió un error al obtener actividades disponibles para el usuario.',
    });
  }
};

export {
  assignUserToActivityController,
  getActivitiesAssigmentsByActivityController,
  getLoggedActivitiesController,
  unassignUserFromActivityController,
  updateActivityAssignmentController,
  getActivitiesAssigmentsController,
  getActivityAssigmentController,
  getUserNotCompletedAssignmentsController,
};

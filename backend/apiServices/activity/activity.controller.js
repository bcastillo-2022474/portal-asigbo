/* eslint-disable no-await-in-loop */
import fs from 'node:fs';
import { connection } from '../../db/connection.js';
import uploadFileToBucket from '../../services/cloudStorage/uploadFileToBucket.js';
import consts from '../../utils/consts.js';
import CustomError from '../../utils/customError.js';
import exists from '../../utils/exists.js';
import {
  getActivityAssignments,
  getCompletedActivityAssignmentsById,
  getUserActivityAssignments,
} from '../activityAssignment/activityAssignment.model.js';
import {
  getAreasWhereUserIsResponsible,
  validateResponsible as validateAreaResponsible,
} from '../asigboArea/asigboArea.model.js';
import { forceSessionTokenToUpdate } from '../session/session.model.js';
import {
  addRoleToUser,
  removeRoleFromUser,
  updateServiceHours,
} from '../user/user.model.js';
import { single } from './activity.dto.js';
import {
  createActivity,
  deleteActivity,
  getActivities,
  getActivitiesWhereUserIsResponsible,
  getActivity,
  getAvailableActivitiesToParticipate,
  updateActivity,
  updateActivityBlockedStatus,
  updateActivityInAllAssignments,
} from './activity.model.js';
import deleteFileInBucket from '../../services/cloudStorage/deleteFileInBucket.js';
import Promotion from '../promotion/promotion.model.js';
import errorSender from '../../utils/errorSender.js';
import { verifyIfUserIsTreasurer } from '../payment/payment.model.js';
import getUTCDate from '../../utils/getUTCDate.js';

const removeActivityResponsibleRole = async ({ idUser, session }) => {
  const result = await getActivitiesWhereUserIsResponsible({ idUser, session });
  if (!result) {
    // La única actividad en la que es responsable es en la que se le eliminó, retirar permiso
    await removeRoleFromUser({ idUser, role: consts.roles.activityResponsible, session });
    // Forzar actualizar sesión del usuario
    await forceSessionTokenToUpdate({ idUser, session });
  }
};

const addActivityResponsibleRole = async ({ responsible, session }) => Promise.all(
  responsible?.map(async (idUser) => {
    const roleAdded = await addRoleToUser({
      idUser,
      role: consts.roles.activityResponsible,
      session,
    });
    if (roleAdded) await forceSessionTokenToUpdate({ idUser, session });
  }),
);

const saveBannerPicture = async ({ file, idActivity }) => {
  const filePath = `${global.dirname}/files/${file.fileName}`;

  // subir archivos

  const fileKey = `${consts.bucketRoutes.activity}/${idActivity}`;

  try {
    await uploadFileToBucket(fileKey, filePath, file.type);
  } catch (ex) {
    fs.unlink(filePath, () => {}); // eliminar archivos temporales

    throw new CustomError('No se pudo cargar el banner de la actividad.', 500);
  }

  // eliminar archivos temporales
  fs.unlink(filePath, () => {});
};

const createActivityController = async (req, res) => {
  const {
    name,
    date,
    serviceHours,
    responsible,
    idAsigboArea,
    registrationStartDate,
    registrationEndDate,
    participatingPromotions,
    participantsNumber,
    description,
    registrationAvailable,

  } = req.body;

  const session = await connection.startSession();

  try {
    session.startTransaction();

    // Verificar que el usuario es admin o encargado del área de la actividad
    const { role, id: idUser } = req.session;
    if (!role.includes(consts.roles.admin)) {
      await validateAreaResponsible({ idUser, idArea: idAsigboArea });
    }

    // Verificar si hay una imagen subida
    const hasBanner = exists(req.uploadedFiles?.[0]);

    const activityResult = await createActivity({
      name,
      date,
      serviceHours,
      responsible,
      idAsigboArea,
      registrationStartDate,
      registrationEndDate,
      participatingPromotions: participatingPromotions === 'null' ? null : participatingPromotions,
      participantsNumber,
      description,
      registrationAvailable,
      hasBanner,
      session,
    });

    // Verificar si el área está bloqueada
    if (activityResult.asigboArea.blocked) {
      throw new CustomError('El eje de ASIGBO correspondiente se encuentra bloqueado.', 409);
    }

    // añadir roles de responsables de actividad
    await addActivityResponsibleRole({ responsible, session });

    // subir banner
    if (hasBanner) {
      await saveBannerPicture({ file: req.uploadedFiles[0], idActivity: activityResult.id });
    }

    await session.commitTransaction();

    res.send(activityResult);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al crear nueva actividad.', session,
    });
  } finally {
    session.endSession();
  }
};

const updateActivityController = async (req, res) => {
  const { idUser, role } = req.session;
  const { idActivity } = req.params;
  const {
    name,
    date,
    serviceHours,
    responsible,
    paymentAmount,
    registrationStartDate,
    registrationEndDate,
    participatingPromotions,
    participantsNumber,
    removeBanner,
    description,
    registrationAvailable,

  } = req.body;

  const session = await connection.startSession();

  try {
    session.startTransaction();

    const idPayment = null;
    if (paymentAmount !== undefined && paymentAmount !== null) {
      // lógica para generar pago
    }

    // Validar si se ha agregado o retirado el banner
    let hasBanner = null; // Si no se agregó, no se realizan cambios
    if (req.uploadedFiles?.length > 0) hasBanner = true;
    if (removeBanner) hasBanner = false;

    const { updatedData, dataBeforeChange } = await updateActivity({
      session,
      id: idActivity,
      name,
      date,
      serviceHours,
      responsible,
      idPayment,
      registrationStartDate,
      registrationEndDate,
      participatingPromotions: participatingPromotions === 'null' ? null : participatingPromotions,
      maxParticipantsNumber: participantsNumber,
      registrationAvailable,
      hasBanner,
      description,
    });

    // Verificar que el usuario es admin o encargado del área de la actividad
    if (!role.includes(consts.roles.admin)) {
      await validateAreaResponsible({ idUser, idArea: dataBeforeChange.asigboArea.id });
    }

    // Verificar si el eje está bloqueado
    if (updatedData.asigboArea.blocked) {
      throw new CustomError('El eje de ASIGBO correspondiente se encuentra bloqueado.', 409);
    }

    // actualizar actividad en asignaciones
    if (
      updatedData.name !== dataBeforeChange.name
      || updatedData.date !== dataBeforeChange.date
      || updatedData.serviceHours !== dataBeforeChange.serviceHours
      || updatedData.asigboArea.id !== dataBeforeChange.asigboArea.id
    ) {
      await updateActivityInAllAssignments({
        activity: { ...updatedData, _id: updatedData.id },
        session,
      });
    }

    // actualizar horas de servicio en usuario
    if (updatedData.serviceHours !== dataBeforeChange.serviceHours) {
      const completedAssignments = await getCompletedActivityAssignmentsById(updatedData.id);

      // Modificar valor para cada usuario
      const promises = [];
      completedAssignments?.forEach((assignment) => {
        const userId = assignment.user._id;

        promises.push(
          updateServiceHours({
            userId,
            asigboAreaId: updatedData.asigboArea.id,
            hoursToRemove: dataBeforeChange.serviceHours,
            hoursToAdd: updatedData.serviceHours,
            session,
          }),
        );
      });

      await Promise.all(promises);
    }

    // modificar el monto del pago o eliminarlo (pendiente)

    // retirar permisos a responsables retirados
    const usersRemoved = dataBeforeChange.responsible
      .filter(
        (beforeUser) => !updatedData.responsible.some((updatedUser) => beforeUser.id === updatedUser.id),
      )
      .map((user) => user.id);
    await Promise.all(
      usersRemoved.map((userId) => removeActivityResponsibleRole({ idUser: userId, session })),
    );

    // añadir permisos a nuevos responsables
    const usersAdded = updatedData.responsible
      .filter(
        (updatedUser) => !dataBeforeChange.responsible.some((beforeUser) => beforeUser.id === updatedUser.id),
      )
      .map((user) => user.id);

    await addActivityResponsibleRole({ responsible: usersAdded, session });

    // Eliminar archivo previo si ya había un banner
    if (dataBeforeChange.hasBanner && (hasBanner || removeBanner)) {
      const fileKey = `${consts.bucketRoutes.activity}/${idActivity}`;
      try {
        await deleteFileInBucket(fileKey);
      } catch (ex) {
        // Error no crítico, no se eliminó el banner
      }
    }

    // Subir nuevo banner
    if (hasBanner) {
      await saveBannerPicture({ file: req.uploadedFiles[0], idActivity });
    }

    await session.commitTransaction();

    res.send(single(updatedData));
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al actualizar actividad.', session,
    });
  } finally {
    session.endSession();
  }
};

const deleteActivityController = async (req, res) => {
  const { id: idUser, role } = req.session;
  const { idActivity } = req.params;

  const session = await connection.startSession();

  try {
    session.startTransaction();

    const activity = await getActivity({
      idActivity,
      showSensitiveData: true,
    });
    if (!activity) throw new CustomError('No se encontró la actividad.', 404);
    const {
      responsible,
      asigboArea: { id: idArea, blocked },
    } = activity;

    if (!role.includes(consts.roles.admin)) {
      await validateAreaResponsible({ idUser, idArea });
    }

    // Verificar que el eje no se encuentre bloqueado
    if (blocked) {
      throw new CustomError('El eje de ASIGBO correspondiente se encuentra bloqueado.', 409);
    }

    // Verificar que la actividad no tenga asignaciones
    const assignments = await getActivityAssignments({
      idActivity,
      includeUserPromotionGroup: false,
    });

    if (assignments?.length > 0) {
      throw new CustomError(
        'La actividad no puede ser eliminada mientras existan usuarios asignados.',
      );
    }

    await deleteActivity({ idActivity, session });

    // retirar permisos a responsables retirados
    await Promise.all(
      responsible?.map((user) => removeActivityResponsibleRole({ idUser: user.id, session })),
    );

    // Eliminar banner si existe
    if (activity.hasBanner) {
      try {
        const fileKey = `${consts.bucketRoutes.activity}/${activity.id}`;
        await deleteFileInBucket(fileKey);
      } catch (err) {
        // error al eliminar archivo (no critico)
      }
    }

    await session.commitTransaction();

    res.sendStatus(204);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al eliminar actividad.', session,
    });
  } finally {
    session.endSession();
  }
};

const getActivitiesController = async (req, res) => {
  const {
    asigboArea, search, lowerDate, upperDate, page,
  } = req.query;

  try {
    let completeResult = null;
    if (exists(page)) {
      // Obtener número total de resultados si se selecciona página
      completeResult = await getActivities({
        idAsigboArea: asigboArea,
        search,
        lowerDate,
        upperDate,
      });
    }

    const result = await getActivities({
      idAsigboArea: asigboArea,
      search,
      lowerDate,
      upperDate,
      page,
      sort: true,
    });

    // Si es admin, retornar lista completa
    if (req.session.role.includes(consts.roles.admin)) {
      return res.send({
        pages: Math.ceil((completeResult?.length ?? result.length) / consts.resultsNumberPerPage),
        resultsPerPage: consts.resultsNumberPerPage,
        result,
      });
    }

    // filtrar dependiendo de privilegio
    const areasWhereUserIsResponsible = [];
    const activitiesWhereUserIsResponsible = [];

    // Obtener áreas donde es encargado el usuario
    if (req.session.role.includes(consts.roles.asigboAreaResponsible)) {
      const areas = await getAreasWhereUserIsResponsible({ idUser: req.session.id });
      if (areas) {
        areasWhereUserIsResponsible.push(...areas.map((area) => area.id));
      }
    }

    // Obtener id de actividades donde es encargado el usuario
    if (req.session.role.includes(consts.roles.activityResponsible)) {
      const activities = await getActivitiesWhereUserIsResponsible({ idUser: req.session.id });
      if (activities) activitiesWhereUserIsResponsible.push(...activities.map((ac) => ac.id));
    }

    const filteredCompleteResult = completeResult?.filter(
      (activity) => areasWhereUserIsResponsible.includes(activity.asigboArea.id)
        || activitiesWhereUserIsResponsible.includes(activity.id),
    );

    const filteredResult = result.filter(
      (activity) => areasWhereUserIsResponsible.includes(activity.asigboArea.id)
        || activitiesWhereUserIsResponsible.includes(activity.id),
    );

    if (filteredResult.length === 0) throw new CustomError('No se encontraron resultados.', 404);

    res.send({
      pages: Math.ceil(
        (filteredCompleteResult?.length ?? filteredResult.length) / consts.resultsNumberPerPage,
      ),
      resultsPerPage: consts.resultsNumberPerPage,
      result: filteredResult,
    });
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al obtener lista de actividades.',
    });
  }
  return null;
};

const getActivityController = async (req, res) => {
  const { idActivity } = req.params;
  const { id: sessionIdUser, promotion: sessionUserPromotion } = req.session;

  try {
    const activity = await getActivity({ idActivity, showSensitiveData: true });
    if (!activity) throw new CustomError('No se encontró la actividad.', 404);

    // Para el área de asigbo, verificar si el usuario es encargado
    let isResponsible = false;
    const areas = await getAreasWhereUserIsResponsible({ idUser: sessionIdUser });
    if (areas) {
      isResponsible = areas?.some((area) => area.id === activity.asigboArea.id);
    }

    activity.asigboArea.isResponsible = isResponsible;

    // Especificar si el usuario es tesorero del pago de la actividad
    if (activity.payment) {
      activity.payment.isTreasurer = await verifyIfUserIsTreasurer({
        idPayment: activity.payment._id,
        idUser: sessionIdUser,
      });
    }

    // Adjuntar asignación (si existe) del usuario en sesión
    const assignment = await getActivityAssignments({ idUser: req.session.id, idActivity });
    if (assignment !== null) {
      // eslint-disable-next-line prefer-destructuring
      activity.userAssignment = assignment[0];
    }

    const promotionObj = new Promotion();

    /// Verificar si el usuario puede asignarse (si no lo está ya)
    let registrationAvailable;

    // Si no hay asignación previa
    if (!assignment) {
      const currentDate = getUTCDate();
      const registrationStartDate = getUTCDate(activity.registrationStartDate);
      const registrationEndDate = getUTCDate(activity.registrationEndDate);

      const isActivityBlocked = activity.blocked;
      const isRegistrationUnavailable = !activity.registrationAvailable;
      const isRegistrationOutOfDate = registrationStartDate > currentDate
      || registrationEndDate < currentDate;
      const isMaxParticipantsReached = activity.participantsNumber >= activity.maxParticipants;

      if (isActivityBlocked || isRegistrationUnavailable || isRegistrationOutOfDate || isMaxParticipantsReached) {
        registrationAvailable = false; // La actividad no recibe más inscripciones
      } else {
        const promotions = activity.participatingPromotions;
        const isPromotionAvailable = promotions === null
            || promotions.includes(sessionUserPromotion)
            || promotions.includes(await promotionObj.getPromotionGroup(sessionUserPromotion));

        // Verificar si está disponible para su promoción
        registrationAvailable = isPromotionAvailable;
      }
    } else {
      registrationAvailable = false;
    }
    activity.registrationAvailableForUser = registrationAvailable;

    // Añadir grupo de promoción de responsables
    activity.responsible = await Promise.all(
      activity.responsible.map(async (user) => ({
        ...user,
        promotionGroup: await promotionObj.getPromotionGroup(user.promotion),
      })),
    );

    res.send(activity);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al obtener información de la actividad.',
    });
  }
};

const disableActivityController = async (req, res) => {
  const { idActivity } = req.params;

  const session = await connection.startSession();
  try {
    session.startTransaction();

    const activity = await getActivity({ idActivity });
    if (!activity) throw new CustomError('No se encontró la actividad.', 404);

    // Si no es admin, verificar si es encargado de área
    if (!req.session.role.includes(consts.roles.admin)) {
      await validateAreaResponsible({ idUser: req.session.id, idArea: activity.asigboArea });
    }

    // Verificar que el eje no se encuentre bloqueado
    if (activity.asigboArea.blocked) {
      throw new CustomError('El eje de ASIGBO correspondiente se encuentra bloqueado.', 409);
    }

    const updatedActivity = await updateActivityBlockedStatus({
      idActivity,
      blocked: true,
      session,
    });

    await updateActivityInAllAssignments({ activity: updatedActivity, session });

    await session.commitTransaction();
    res.sendStatus(204);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al deshabilitar la actividad.', session,
    });
  } finally {
    session.endSession();
  }
};

const enableActivityController = async (req, res) => {
  const { idActivity } = req.params;

  const session = await connection.startSession();
  try {
    session.startTransaction();

    const activity = await getActivity({ idActivity });
    if (!activity) throw new CustomError('No se encontró la actividad.', 404);

    // Si no es admin, verificar si es encargado de área
    if (!req.session.role.includes(consts.roles.admin)) {
      await validateAreaResponsible({ idUser: req.session.id, idArea: activity.asigboArea });
    }

    // Verificar que el eje no se encuentre bloqueado
    if (activity.asigboArea.blocked) {
      throw new CustomError('El eje de ASIGBO correspondiente se encuentra bloqueado.', 409);
    }

    const updatedActivity = await updateActivityBlockedStatus({
      idActivity,
      blocked: false,
      session,
    });

    await updateActivityInAllAssignments({ activity: updatedActivity, session });

    await session.commitTransaction();

    res.sendStatus(204);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al habilitar la actividad.', session,
    });
  } finally {
    session.endSession();
  }
};

const getActivitiesWhereUserIsResponsibleController = async (req, res) => {
  const { idUser } = req.params;
  const {
    search, lowerDate, upperDate, page,
  } = req.query;
  try {
    // Validar permisos de acceso
    if (!req.session?.role?.includes(consts.roles.admin) && idUser !== req.session.id) {
      throw new CustomError(
        'No se cuentan con los privilegios para acceder a la información de este usuario.',
        403,
      );
    }

    let pagesNumber = null;
    if (exists(page)) {
      // Obtener número total de resultados si se selecciona página
      const completeResult = await getActivitiesWhereUserIsResponsible({
        idUser,
        search,
        lowerDate,
        upperDate,
      });
      if (!completeResult) throw new CustomError('No se encontraron resultados.', 404);
      pagesNumber = completeResult.length;
    }

    const result = await getActivitiesWhereUserIsResponsible({
      idUser,
      search,
      lowerDate,
      upperDate,
      page,
      sort: true,
    });
    if (!result) throw new CustomError('No se encontraron resultados.', 404);

    res.send({
      pages: Math.ceil((pagesNumber ?? result.length) / consts.resultsNumberPerPage),
      resultsPerPage: consts.resultsNumberPerPage,
      result,
    });
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al obtener las actividades en las que el usuario es encargado.',
    });
  }
};

const getAvailableActivitiesToParticipateController = async (req, res) => {
  const { id: idUser, promotion } = req.session;
  const { lowerDate, upperDate, search } = req.query;
  try {
    const promotionObj = new Promotion();
    const promotionGroup = await promotionObj.getPromotionGroup(promotion);

    // Obtener asignaciones de usuario para ignorar actividades en las que ya fue inscrito
    const assignments = await getUserActivityAssignments({ idUser });
    const assignmentsId = assignments?.map((assignment) => assignment.activity._id);

    const result = await getAvailableActivitiesToParticipate({
      promotionYear: promotion, promotionGroup, lowerDate, upperDate, search, activitiesToIgnore: assignmentsId,
    });

    if (!result) throw new CustomError('No se encontraron resultados.', 404);
    res.send(result);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrió un error al obtener actividades disponibles para el usuario.',
    });
  }
};

export {
  createActivityController,
  updateActivityController,
  deleteActivityController,
  getActivitiesController,
  getActivityController,
  disableActivityController,
  enableActivityController,
  getActivitiesWhereUserIsResponsibleController,
  getAvailableActivitiesToParticipateController,
};

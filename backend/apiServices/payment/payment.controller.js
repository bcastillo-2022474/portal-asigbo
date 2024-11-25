import fs from 'node:fs';
import { connection } from '../../db/connection.js';
import uploadFileToBucket from '../../services/cloudStorage/uploadFileToBucket.js';
import consts from '../../utils/consts.js';
import CustomError from '../../utils/customError.js';
import errorSender from '../../utils/errorSender.js';
import Promotion from '../promotion/promotion.model.js';
import { getUsersByPromotion, getUsersInList, removeRoleFromUser } from '../user/user.model.js';
import { createPayment } from './payment.mediator.js';
import {
  assignPaymentToUsers,
  completePayment,
  confirmPayment,
  deleteAllPaymentAssignments,
  deletePayment,
  getPaymentAssignmetById,
  getPaymentById,
  getPaymentAssignments,
  removePaymentDependencies,
  resetPaymentCompletedStatus,
  updatePayment,
  updatePaymentInAllDependencies,
  verifyIfUserIsTreasurer,
  hasPaymentsAsTreasurer,
  getPaymentsWhereUserIsTreasurer,
} from './payment.model.js';
import exists from '../../utils/exists.js';
import compareObjectId from '../../utils/compareObjectId.js';
import deleteFileInBucket from '../../services/cloudStorage/deleteFileInBucket.js';
import writeLog from '../../utils/writeLog.js';
import PaymentSchema from '../../db/schemas/payment.schema.js';
import { forceSessionTokenToUpdate } from '../session/session.model.js';
import { assignPaymentToActivity, getActivity, getActivityByPaymentId } from '../activity/activity.model.js';
import { validateResponsible as validateAsigboAreaResponsible } from '../asigboArea/asigboArea.model.js';
import { addPaymentsToActivityAssignments, getActivityAssignedUsers } from '../activityAssignment/activityAssignment.model.js';

const savePaymentVoucherPicture = async ({ file, idPayment, idUser }) => {
  const filePath = `${global.dirname}/files/${file.fileName}`;

  // subir archivos

  const imageId = `${idPayment}/${idUser}`;
  const fileKey = `${consts.bucketRoutes.paymentVoucher}/${imageId}`;

  try {
    await uploadFileToBucket(fileKey, filePath, file.type);
  } catch (ex) {
    throw new CustomError('No se pudo cargar los comprobantes de pago.', 500);
  }

  return imageId;
};

const validateTreasurerRole = async ({ idPayment, idUser }) => {
  const payment = await PaymentSchema.findById(idPayment);
  if (!Array.isArray(payment?.treasurer)
  || !payment.treasurer.some((user) => compareObjectId(user.id, idUser))) {
    throw new CustomError('No tienes los privilegios para relizar esta acción.', 403);
  }
};

const removeTreasurerRole = async ({ idUser, session }) => {
  // Remover rol solo si ya no tiene más pagos a cargo
  const userIsTreasurer = await hasPaymentsAsTreasurer({ idUser, session });
  if (!userIsTreasurer) {
    await removeRoleFromUser({ idUser, role: consts.roles.treasurer, session });
    // Forzar actualizar sesión del usuario
    await forceSessionTokenToUpdate({ idUser, session });
  }
};

/**
 * Verifica si un usuario es encargado del area padre de la actividad a la que está asignada el pago.
 * @returns Boolean. True si es encargado, false de lo contrario.
 */
const hasAreaResponsiblePermission = async ({ idUser, idPayment, session }) => {
  const activity = await getActivityByPaymentId({ idPayment, session });
  if (activity) {
    const isResponsible = await validateAsigboAreaResponsible({ idUser, idArea: activity.asigboArea._id, preventError: true });
    if (isResponsible) return true;
  }
  return false;
};

const createGeneralPaymentController = async (req, res) => {
  const {
    name, amount, description, limitDate, treasurer, promotion,
  } = req.body;
  const session = await connection.startSession();
  try {
    session.startTransaction();

    // si se da un grupo de usuarios, definir rango de promociones
    let promotionMin = null;
    let promotionMax = null;

    if (promotion && Number.isNaN(parseInt(promotion, 10))) {
      const promotionObj = new Promotion();
      const result = await promotionObj.getPromotionRange({ promotionGroup: promotion });
      promotionMin = result.promotionMin;
      promotionMax = result.promotionMax;
    }

    // Obtener objeto de usuarios a asignar (sin bloqueados)
    // Genera error si no se encuentra usuarios
    const usersList = await getUsersByPromotion({
      promotion,
      promotionMin,
      promotionMax,
      includeBlocked: false,
      session,
    });

    if (!usersList || usersList.length === 0) {
      throw new CustomError(
        'No se encontraron usuarios para la promoción o grupo de promociones especificado.',
        404,
      );
    }

    // Crear pago
    const payment = await createPayment({
      name,
      limitDate,
      amount,
      description,
      treasurerUsersId: treasurer,
      targetUsers: promotion,
      session,
    });

    // Generar asignaciones de pagos a usuarios
    await assignPaymentToUsers({ users: usersList, payment, session });

    await session.commitTransaction();

    res.status(204).send(payment);
  } catch (ex) {
    await errorSender({
      res,
      ex,
      defaultError: 'Ocurrio un error al crear nuevo pago general.',
      session,
    });
  } finally {
    session.endSession();
  }
};

const completePaymentController = async (req, res) => {
  const { idPaymentAssignment } = req.params;
  const voucherFiles = req.uploadedFiles;
  const { id: idUser } = req.session;

  // Validar cantidad de archivos
  if (!exists(voucherFiles?.length) || voucherFiles.length === 0) {
    errorSender({
      res,
      defaultError: "El campo 'voucher' debe incluir por lo menos un archivo.",
      defaultStatus: 400,
    });
    return;
  }

  const session = await connection.startSession();

  let voucherKeys = null;
  try {
    session.startTransaction();

    const paymentAssignment = await getPaymentAssignmetById({ idPaymentAssignment });

    if (!paymentAssignment) throw new CustomError('La asignación de pago no existe.', 404);
    if (!compareObjectId(idUser, paymentAssignment.user.id)) throw new CustomError('No estas autorizado para completar el pago.', 403);
    if (paymentAssignment.completed === true) throw new CustomError('El pago ya fue completado.', 400);

    // Subir archivos de vouchers
    voucherKeys = await Promise.all(
      voucherFiles.map((file) => savePaymentVoucherPicture({
        file,
        idPayment: paymentAssignment.payment.id,
        idUser: paymentAssignment.user.id,
      })),
    );
    await completePayment({ idPaymentAssignment, voucherKeys, session });

    await session.commitTransaction();
    res.status(204).send({ ok: true });
  } catch (ex) {
    await errorSender({
      res,
      ex,
      defaultError: 'Ocurrio un error al completar pago.',
      session,
    });

    // Si hubo un error, intentar eliminar archivos en bucket
    voucherKeys?.map((fileKey) => deleteFileInBucket(fileKey).catch((err) => writeLog(2, err)));
  } finally {
    session.endSession();

    // Eliminar archivos temporales
    voucherFiles.forEach(({ fileName }) => {
      const filePath = `${global.dirname}/files/${fileName}`;
      fs.unlink(filePath, (err) => {
        if (err) writeLog(2, 'Error al eliminar archivos temporales vouchers: ', err);
      });
    });
  }
};

const resetPaymentCompletedStatusController = async (req, res) => {
  const { idPaymentAssignment } = req.params;
  const { id: idUser, role } = req.session;

  try {
    const paymentAssignment = await getPaymentAssignmetById({ idPaymentAssignment });

    const idPayment = paymentAssignment.payment._id;
    // Validar privilegios para editar pago
    // Admin o encargado del area de asigbo al que pertenece la actividad del pago (autorizados de editar actividad)
    if (!role?.includes(consts.roles.admin)) {
      if (!role?.includes(consts.roles.asigboAreaResponsible) || !(await hasAreaResponsiblePermission({ idUser, idPayment }))) {
        throw new CustomError('No estás autorizado de realizar esta acción.', 403);
      }
    }

    if (!paymentAssignment) throw new CustomError('La asignación de pago no existe.', 404);
    if (paymentAssignment.confirmed) throw new CustomError('No se puede resetear el status de completado a un pago ya confirmado.', 400);

    await validateTreasurerRole({ idPayment: paymentAssignment.payment._id, idUser });

    if (paymentAssignment.completed) {
      await resetPaymentCompletedStatus({ idPaymentAssignment });
    }

    res.status(204).send({ ok: true });
  } catch (ex) {
    await errorSender({
      res,
      ex,
      defaultError: 'Ocurrio un error al resetear status de pago completado.',
    });
  }
};

const confirmPaymentController = async (req, res) => {
  const { idPaymentAssignment } = req.params;
  const { id: idUser, role } = req.session;

  try {
    const paymentAssignment = await getPaymentAssignmetById({ idPaymentAssignment });

    const idPayment = paymentAssignment.payment._id;
    // Validar privilegios para editar pago
    // Admin o encargado del area de asigbo al que pertenece la actividad del pago (autorizados de editar actividad)
    if (!role?.includes(consts.roles.admin)) {
      if (!role?.includes(consts.roles.asigboAreaResponsible) || !(await hasAreaResponsiblePermission({ idUser, idPayment }))) {
        throw new CustomError('No estás autorizado de realizar esta acción.', 403);
      }
    }

    if (!paymentAssignment) throw new CustomError('La asignación de pago no existe.', 404);
    if (!paymentAssignment.completed) throw new CustomError('El pago aún no ha sido completado.', 400);

    await validateTreasurerRole({ idPayment: paymentAssignment.payment._id, idUser });

    await confirmPayment({ idPaymentAssignment });

    res.status(204).send({ ok: true });
  } catch (ex) {
    await errorSender({
      res,
      ex,
      defaultError: 'Ocurrio un error al resetear status de pago completado.',
    });
  }
};

const updatePaymentController = async (req, res) => {
  const {
    name, amount, description, limitDate, treasurer: treasurerUsersId,
  } = req.body;

  const { idPayment } = req.params;
  const { id: sessionIdUser, role } = req.session;

  const session = await connection.startSession();
  try {
    session.startTransaction();

    // Validar privilegios para editar pago
    // Admin o encargado del area de asigbo al que pertenece la actividad del pago (autorizados de editar actividad)
    if (!role?.includes(consts.roles.admin)) {
      if (!role?.includes(consts.roles.asigboAreaResponsible) || !(await hasAreaResponsiblePermission({ idUser: sessionIdUser, idPayment }))) {
        throw new CustomError('No estás autorizado de realizar esta acción.', 403);
      }
    }
    // Obtener objetos de usuarios tesoreros
    const treasurerUsers = exists(treasurerUsersId)
      ? await getUsersInList({ idUsersList: treasurerUsersId, session, missingUserError: 'Uno de los usuarios especificados como tesoreros no existe.' })
      : null;

    // Actualizar datos de pago
    const { dataBeforeChange, updatedData } = await updatePayment({
      idPayment, name, limitDate, amount, description, treasurer: treasurerUsers, session,
    });

    // Retirar permisos a tesoreros eliminados (si corresponde)
    const usersRemovedId = dataBeforeChange.treasurer
      .filter(
        (beforeUser) => !updatedData.treasurer.some((updatedUser) => beforeUser._id === updatedUser._id),
      )
      .map((user) => user._id);

    // retirar role de tesorero
    await Promise.all(usersRemovedId.map((idUser) => removeTreasurerRole({ idUser, session })));

    // Actualizar pago en subdocumentos
    await updatePaymentInAllDependencies({ payment: updatedData, session });

    await session.commitTransaction();

    res.status(200).send(updatedData);
  } catch (ex) {
    await errorSender({
      res,
      ex,
      defaultError: 'Ocurrio un error al actualizar pago general.',
      session,
    });
  } finally {
    session.endSession();
  }
};

const deletePaymentController = async (req, res) => {
  const { idPayment } = req.params;
  const { id: sessionIdUser, role } = req.session;

  const session = await connection.startSession();
  try {
    session.startTransaction();

    // Validar privilegios para editar pago
    // Admin o encargado del area de asigbo al que pertenece la actividad del pago (autorizados de editar actividad)
    if (!role?.includes(consts.roles.admin)) {
      if (!role?.includes(consts.roles.asigboAreaResponsible) || !(await hasAreaResponsiblePermission({ idUser: sessionIdUser, idPayment }))) {
        throw new CustomError('No estás autorizado de realizar esta acción.', 403);
      }
    }

    // Eliminar pago y asignaciones de pago
    const payment = await deletePayment({ idPayment, session });
    await deleteAllPaymentAssignments({ idPayment, session });

    // Si el pago está vinculado a una actividad, removerlo de los respectivos documentos
    if (payment.activityPayment) {
      await removePaymentDependencies({ idPayment, preventError: true, session });
    }

    await session.commitTransaction();

    res.status(204).send({ ok: true });
  } catch (ex) {
    await errorSender({
      res,
      ex,
      defaultError: 'Ocurrio un error al actualizar pago general.',
      session,
    });
  } finally {
    session.endSession();
  }
};

const createActivityPaymentController = async (req, res) => {
  const {
    idActivity, name, amount, description, limitDate, treasurer,
  } = req.body;
  const { id: idUser, role } = req.session;
  const session = await connection.startSession();
  try {
    session.startTransaction();

    // Retorna 404 si no encuentra actividad
    const activity = await getActivity({ idActivity });
    if (!activity) throw new CustomError('No se encontró la actividad.', 404);

    // Validar si es encargado del area de asigbo de la actividad
    if (!role.includes(consts.roles.admin)) {
      await validateAsigboAreaResponsible({ idUser, idArea: activity.asigboArea._id });
    }

    const assignedUsers = await getActivityAssignedUsers({ idActivity });

    // Crear pago
    const payment = await createPayment({
      name,
      limitDate,
      amount,
      description,
      treasurerUsersId: treasurer,
      targetUsers: consts.strings.activityPaymentTargetUsers,
      activityPayment: true,
      session,
    });

    // agregar pago a actividad
    await assignPaymentToActivity({ idActivity, payment, session });

    if (assignedUsers.length > 0) {
      // Generar asignaciones de pagos a usuarios
      const paymentAssignmentsList = await assignPaymentToUsers({ users: assignedUsers, payment, session });

      // Agregar asignaciones de pagos en asignaciones de actividades
      await addPaymentsToActivityAssignments({ idActivity, paymentAssignmentsList, session });
    }

    await session.commitTransaction();

    res.status(200).send(payment);
  } catch (ex) {
    await errorSender({
      res,
      ex,
      defaultError: 'Ocurrio un error al crear nuevo pago general.',
      session,
    });
  } finally {
    session.endSession();
  }
};

const getUserPaymentAssignmentsController = async (req, res) => {
  const { idUser } = req.params;
  const { role, id: sessionIdUser } = req.session;
  const { state, page } = req.query;
  try {
    // Validar privilegios
    if (idUser !== sessionIdUser && !role.includes(consts.roles.admin)) {
      throw new CustomError('No estás autorizado para obtener esta información.', 403);
    }

    const result = await getPaymentAssignments({ idUser, state, page });
    if (result === null) throw new CustomError('No se encontraron resultados.', 404);
    res.send(result);
  } catch (ex) {
    await errorSender({
      res,
      ex,
      defaultError: 'Ocurrio un error al obtener asignaciones de pago del usuario.',
    });
  }
};

const getPaymentController = async (req, res) => {
  const { idPayment } = req.params;
  const { role, sessionIdUser } = req.session;
  try {
    // Validar privilegios para acceder a datos de pago
    // Admin, tesorero o encargado del area de asigbo al que pertenece la actividad del pago (autorizados de editar actividad)
    const isAdmin = role.includes(consts.roles.admin);
    if (!isAdmin) {
      const isTreasurer = role?.includes(consts.roles.treasurer) && await verifyIfUserIsTreasurer({ idPayment, idUser: sessionIdUser });

      if (!isTreasurer) {
        const isAreaResponsible = role?.includes(consts.roles.asigboAreaResponsible) && (
          await hasAreaResponsiblePermission({ idUser: sessionIdUser, idPayment }));

        if (!isAreaResponsible) {
          throw new CustomError('No estás autorizado de obtener esta información.', 403);
        }
      }
    }

    const payment = await getPaymentById({ idPayment });

    if (!payment) throw new CustomError('No se encontró el pago.', 404);

    res.send(payment);
  } catch (ex) {
    await errorSender({
      res,
      ex,
      defaultError: 'Ocurrio un error al obtener detalles de pago.',
    });
  }
};

const getPaymentAssignmentController = async (req, res) => {
  const { idPaymentAssignment } = req.params;
  const { role, id: sessionIdUser } = req.session;
  const isAdmin = role.includes(consts.roles.admin);
  try {
    const paymentAssignment = await getPaymentAssignmetById({ idPaymentAssignment });
    if (!paymentAssignment) throw new CustomError('No se encontró la asignación de pago.', 404);

    const idPayment = paymentAssignment.payment._id;

    const isTreasurer = await verifyIfUserIsTreasurer({ idPayment, idUser: sessionIdUser });
    const isPaymentOwner = compareObjectId(paymentAssignment.user._id, sessionIdUser);

    // Validar permisos para obtener información
    if (!isAdmin && !isTreasurer && !isPaymentOwner) {
      const isAreaResponsible = role?.includes(consts.roles.asigboAreaResponsible) && (
        await hasAreaResponsiblePermission({ idUser: sessionIdUser, idPayment }));

      if (!isAreaResponsible) {
        throw new CustomError('No estás autorizado para acceder a esta información.', 403);
      }
    }

    paymentAssignment.isTreasurer = isTreasurer;
    paymentAssignment.vouchersKey = paymentAssignment.vouchersKey?.map((voucherKey) => `${consts.imagePath.paymentVoucher}/${voucherKey}`);
    res.send(paymentAssignment);
  } catch (ex) {
    await errorSender({
      res,
      ex,
      defaultError: 'Ocurrio un error al obtener detalles de pago.',
    });
  }
};

const getPaymentAssignmentsListController = async (req, res) => {
  const { idPayment } = req.params;
  const { role, id: sessionIdUser } = req.session;
  const { state, page, promotion } = req.query;
  try {
    // Validar acceso a asignaciones de pago
    const isAdmin = role?.includes(consts.roles.admin);
    if (!isAdmin) {
      const isTreasurer = role?.includes(consts.roles.treasurer)
        && await verifyIfUserIsTreasurer({ idPayment, idUser: sessionIdUser });

      if (!isTreasurer) {
        const isAreaResponsible = role?.includes(consts.roles.asigboAreaResponsible) && (
          await hasAreaResponsiblePermission({ idUser: sessionIdUser, idPayment }));

        if (!isAreaResponsible) {
          throw new CustomError('No estás autorizado de realizar esta acción.', 403);
        }
      }
    }

    const promotionObj = new Promotion();

    let promotionMin = null;
    let promotionMax = null;
    // si se da un grupo de usuarios, definir rango de promociones
    if (promotion && Number.isNaN(parseInt(promotion, 10))) {
      const result = await promotionObj.getPromotionRange({ promotionGroup: promotion });
      promotionMin = result.promotionMin;
      promotionMax = result.promotionMax;
    }

    // Obtener asignaciones de pago
    const result = await getPaymentAssignments({
      idPayment, state, page, promotion, promotionMin, promotionMax,
    });
    if (result === null) throw new CustomError('No se encontraron resultados.', 404);
    res.send(result);
  } catch (ex) {
    await errorSender({
      res,
      ex,
      defaultError: 'Ocurrio un error al obtener asignaciones de pago.',
    });
  }
};

const getPaymentsWhereUserIsTreasurerController = async (req, res) => {
  const { id: idUser } = req.session;
  const { page } = req.query;
  try {
    const result = await getPaymentsWhereUserIsTreasurer({ idUser, page });

    if (result === null) throw new CustomError('No se encontraron resultados.', 404);

    res.send(result);
  } catch (ex) {
    await errorSender({
      res,
      ex,
      defaultError: 'Ocurrio un error al obtener pagos donde el usuario es tesorero.',
    });
  }
};

export {
  createGeneralPaymentController,
  completePaymentController,
  resetPaymentCompletedStatusController,
  confirmPaymentController,
  updatePaymentController,
  deletePaymentController,
  createActivityPaymentController,
  getUserPaymentAssignmentsController,
  getPaymentController,
  getPaymentAssignmentController,
  getPaymentAssignmentsListController,
  getPaymentsWhereUserIsTreasurerController,
};

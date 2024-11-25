import { ObjectId } from 'mongodb';
import ActivitySchema from '../../db/schemas/activity.schema.js';
import ActivityAssignmentSchema from '../../db/schemas/activityAssignment.schema.js';
import PaymentSchema from '../../db/schemas/payment.schema.js';
import PaymentAssignmentSchema from '../../db/schemas/paymentAssignment.schema.js';
import consts from '../../utils/consts.js';
import CustomError from '../../utils/customError.js';
import exists from '../../utils/exists.js';
import { multiplePaymentDto, singlePaymentDto } from './payment.dto.js';
import { multiplePaymentAssignmentDto, singlePaymentAssignmentDto } from './paymentAssignment.dto.js';
import getUTCDate from '../../utils/getUTCDate.js';

/**
 *
 * @param {string} name Nombre o "Concepto de" del pago
 * @param {Date} limitDate Fecha límite del pago
 * @param {String} description Descripción del pago
 * @param {userSubSchema} treasurer Array de objetos de usuario de tesoreros del pago.
 * @param {string} targetUsers Descripción de grupo de usuarios al que se aplicó pago.
 * @param {boolean} activityPayment Indica si un pago está vinculado a una actividad.

  @returns singlePaymentDto
 */
const createPayment = async ({
  name,
  limitDate,
  amount,
  description,
  treasurer,
  targetUsers,
  activityPayment,
  session,
}) => {
  const payment = new PaymentSchema();

  payment.name = name?.trim();
  payment.limitDate = getUTCDate(limitDate);
  payment.amount = parseFloat(amount);
  payment.description = description?.trim();
  payment.treasurer = treasurer;
  payment.targetUsers = targetUsers?.trim();
  payment.activityPayment = activityPayment;

  await payment.save({ session });
  return singlePaymentDto(payment);
};

/**
 * Crea la asignación de un pago para una lista de usuarios.
 * @param users Listado de usuarios a asignar al pago
 * @param payment Dto payment
 * @param session
 * @returns Listado de PaymentAssignments DTO
 */
const assignPaymentToUsers = async ({ users, payment, session }) => {
  const paymentAssignments = users.map((user) => ({ user, payment }));
  const result = await PaymentAssignmentSchema.insertMany(paymentAssignments, { session });
  return multiplePaymentAssignmentDto(result);
};

/**
 * Se encarga de realizar una asignación de pago individual a un usuario.
 * Si esta asignación ya existe no la duplica, solo retorna la existente
 * @param user Objeto con datos de subschema de usuario.
 * @param payment Objeto con datos de subschema de payment.
 * @param session Session de mongo
 * @returns PaymentAssignment dto.
 */
const assignPaymentToUser = async ({ user, payment, session }) => {
  // Retorna la asignación de pago existente (si la hay)
  const paymentAssignmentRes = await PaymentAssignmentSchema.findOne({
    'payment._id': payment._id,
    'user._id': user._id,
  }).session(session);
  if (paymentAssignmentRes) return singlePaymentAssignmentDto(paymentAssignmentRes);

  // Crear nueva asignación de pago
  const paymentAssignment = new PaymentAssignmentSchema();
  paymentAssignment.user = user;
  paymentAssignment.payment = payment;

  await paymentAssignment.save({ session });

  return singlePaymentAssignmentDto(paymentAssignment);
};

/**
 * Elimina la asignación de un pago para un usuario. Tomar en cuenta que no se pueden eliminar
 * pagos que ya han sido completados.
 * @param {objectId} idUser Id del usuario
 * @param {objectId} idPayment Id del pago
 * @returns Boolean. Indica si se eliminó la asignación
 */
const deletePaymentAssignment = async ({ idUser, idPayment, session }) => {
  const { deletedCount } = await PaymentAssignmentSchema.deleteOne(
    {
      'user._id': idUser,
      'payment._id': idPayment,
      completed: false,
    },
    { session },
  );
  return deletedCount > 0;
};

const getPaymentAssignmetById = async ({ idPaymentAssignment, session }) => {
  const result = await PaymentAssignmentSchema.findById(idPaymentAssignment).session(session);
  return result != null ? singlePaymentAssignmentDto(result) : null;
};

const completePayment = async ({ idPaymentAssignment, voucherKeys, session }) => {
  const { acknowledged, matchedCount } = await PaymentAssignmentSchema.updateOne(
    { _id: idPaymentAssignment },
    { $push: { vouchersKey: { $each: voucherKeys } }, completed: true },
    { session },
  );

  if (matchedCount === 0) throw new CustomError('No se encontró la asignación de pago.', 404);
  if (!acknowledged) throw new CustomError('No se pudo actualizar el status de completado de la asignación de pago.', 500);
};

const resetPaymentCompletedStatus = async ({ idPaymentAssignment, session }) => {
  const { acknowledged, matchedCount } = await PaymentAssignmentSchema.updateOne(
    { _id: idPaymentAssignment },
    { completed: false },
    { session },
  );

  if (matchedCount === 0) throw new CustomError('No se encontró la asignación de pago.', 404);
  if (!acknowledged) throw new CustomError('No se pudo actualizar el status de completado de la asignación de pago.', 500);
};

const confirmPayment = async ({ idPaymentAssignment, session }) => {
  const { acknowledged, matchedCount } = await PaymentAssignmentSchema.updateOne(
    { _id: idPaymentAssignment, completed: true },
    { confirmed: true },
    { session },
  );

  if (matchedCount === 0) throw new CustomError('No se encontró la asignación de pago.', 404);
  if (!acknowledged) throw new CustomError('No se pudo actualizar el status de confirmado de la asignación de pago.', 500);
};

const updatePayment = async ({
  idPayment, name, amount, description, limitDate, treasurer, includeActivityPayments = true, session,
}) => {
  const payment = await PaymentSchema.findById(idPayment);

  if (!payment) throw new CustomError('No se encontró el pago.', 404);

  if (!includeActivityPayments && payment.activityPayment) throw new CustomError('No se puede actualizar pagos vinculados a actividades.', 400);

  const dataBeforeChange = singlePaymentDto(payment);

  if (exists(name)) payment.name = name?.trim();
  if (exists(amount)) payment.amount = amount;
  if (exists(description)) payment.description = description?.trim();
  if (exists(limitDate)) payment.limitDate = getUTCDate(limitDate);
  if (exists(treasurer)) payment.treasurer = treasurer;

  await payment.save({ session });

  const updatedData = singlePaymentDto(payment);
  return { dataBeforeChange, updatedData };
};

/**
 * Retorna los pagos en lo que un usuario figura como un tesorero.
 * @param idUser. Id del usuario.
 * @param page Página a consultar (paginación). Inicia por cero. Si no se proporciona se devuelve la lista completa.
 * @returns Devuelve un array de PaymentsDto con los resultados (incluye assignmentsToConfirm).
 */
const getPaymentsWhereUserIsTreasurer = async ({ idUser, page }) => {
  // Filtrar pagos donde es tesorero

  const query = {
    treasurer: { $elemMatch: { _id: new ObjectId(idUser) } },
  };

  const paymentsCount = await PaymentSchema.countDocuments(query);
  const pages = Math.ceil(paymentsCount / consts.resultsNumberPerPage);

  const queryPipeline = [
    {
      $match: query,
    },
    {
      // Hacer lookup de asignaciones de pago completadas pero no confirmadas
      $lookup: {
        from: 'paymentassignments',
        let: { payment_id: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$payment._id', '$$payment_id'] },
              completed: true,
              confirmed: false,
            },
          },
        ],
        as: 'assignments',
      },
    },
    // Contar asignaciones por confirmar
    {
      $addFields: {
        assignmentsToConfirm: { $size: '$assignments' },
      },
    },
    {
      $project: {
        assignments: 0,
      },
    },
    // Ordenar pagos con mayor número de asignaciones por confirmar primero
    {
      $sort: {
        assignmentsToConfirm: -1,
        limitDate: 1,
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

  const payments = await PaymentSchema.aggregate(queryPipeline);

  if (payments.length === 0) return null;

  return { pages, result: multiplePaymentDto(payments) };
};

/**
 * Verifica si el usuario es tesorero en al menos un pago.
 * @returns Boolean. True si encontró por lo menos un pago en donde figura como tesorero.
 */
const hasPaymentsAsTreasurer = async ({ idUser, session }) => {
  const payments = await PaymentSchema.find({ treasurer: { $elemMatch: { _id: idUser } } }).session(session);

  return payments.length > 0;
};

/**
 * Obtiene pago por medio de id.
 * @returns Payment Dto o null si no hay resultados.
 */
const getPaymentById = async ({ idPayment, session }) => {
  const result = await PaymentSchema.findById(idPayment).session(session);
  return result != null ? singlePaymentDto(result) : null;
};

const updatePaymentInAllDependencies = async ({ payment, session }) => {
  // actualizar pago en documentos de actividad
  await ActivitySchema.updateMany(
    { 'payment._id': payment._id },
    { payment },
    { session },
  );
  // actualizar pago en documentos de actividad
  await PaymentAssignmentSchema.updateMany(
    { 'payment._id': payment._id },
    { payment },
    { session },
  );
};

/**
 * Elimina un pago.
 * @returns Payment Dto del pago eliminado.
 */
const deletePayment = async ({ idPayment, session }) => {
  const payment = await PaymentSchema.findOneAndDelete({ _id: idPayment }, { session });

  if (!payment) throw new CustomError('No se pudo eliminar el pago.', 500);

  return singlePaymentDto(payment);
};

/**
 * Se eliminan todas las asignaciones de un pago, siempre y cuando no hayan sido eliminadas.
 */
const deleteAllPaymentAssignments = async ({ idPayment, session }) => {
  const { acknowledged } = await PaymentAssignmentSchema.deleteMany({ 'payment._id': idPayment, completed: false, vouchersKey: { $size: 0 } }, { session });

  if (!acknowledged) throw new CustomError('No se pudo eliminar las asignaciones de pago.', 500);
};

/**
 * Remueve subdocumentos de pago o asignaciones de pago en actividades y asignaciones de actividades respectivamente.
 * @param {*} param0
 */
const removePaymentDependencies = async ({ idPayment, preventError = false, session }) => {
  const activity = await ActivitySchema.findOneAndUpdate({ 'payment._id': idPayment }, { payment: null }, { session });

  if (!activity && !preventError) throw new CustomError('No se encontró la actividad vinculada al pago.', 404);

  // actualizar asignaciones de esa actividad
  const { acknowledged } = await ActivityAssignmentSchema.updateMany({ 'activity._id': activity._id }, { paymentAssignment: null }, { session });
  if (!acknowledged) throw new CustomError('No se pudo eliminar el pago de las asignaciones a actividades.', 500);
};

/**
 * Verfica si el usuario es tesorero de un pago en específico
 */
const verifyIfUserIsTreasurer = async ({ idPayment, idUser, session }) => {
  const payment = await PaymentSchema.findOne({ _id: idPayment, treasurer: { $elemMatch: { _id: idUser } } }).session(session);
  return payment !== null;
};

/**
 * Obtener asignaciones de pago de un usuario.
 *
 * @param  idUser Filtrar solo las asignaciones de un usuario
 * @param  idPayment Filtrar solo las asignaciones de un pago en específico
 * @param  state 0: pagos no completados, 1: pagos completados pero no confirmados,
 *  2: pagos confirmados, 3: pagos atrasados. Cualquier otro valor muestra la lista completa.
 */
const getPaymentAssignments = async ({
  idUser, idPayment, state, promotion, promotionMin, promotionMax, page, session,
}) => {
  const query = {};

  // Agregar filtro por usuario
  if (exists(idUser)) query['user._id'] = idUser;

  // Agregar filtro por pago
  if (exists(idPayment)) query['payment._id'] = idPayment;

  // Agregar filtros por estado
  switch (parseInt(state, 10)) {
    case 0:
      query.completed = false;
      query.confirmed = false;
      break;
    case 1:
      query.completed = true;
      query.confirmed = false;
      break;
    case 2:
      query.confirmed = true;
      break;
    case 3:
      query.completed = false;
      query.confirmed = false;
      query['payment.limitDate'] = { $lt: getUTCDate() };
      break;
    default:
      // Sin filtro adicionales
      break;
  }

  // agregar filtro por promoción
  if (exists(promotion) && !exists(promotionMin) && !exists(promotionMax)) query['user.promotion'] = { $eq: promotion };
  if (exists(promotionMin)) query['user.promotion'] = { $gte: promotionMin };
  if (exists(promotionMax)) query['user.promotion'] = { $lte: promotionMax };

  // Obtener total de resultados (sin paginación)
  const usersCount = await PaymentAssignmentSchema.countDocuments(query);
  const pages = Math.ceil(usersCount / consts.resultsNumberPerPage);

  // Agregar filtro de paginación
  let skip = 0;
  let limit = null;
  if (exists(page)) {
    skip = page * consts.resultsNumberPerPage;
    limit = consts.resultsNumberPerPage;
  }

  const paymentAssignments = await PaymentAssignmentSchema
    .find(query)
    .skip(skip)
    .limit(limit)
    .session(session);

  if (paymentAssignments.length === 0) return null;
  return { pages, result: multiplePaymentAssignmentDto(paymentAssignments) };
};

const verifyIfUserHasPaymentAssignments = async ({ idUser, session }) => {
  const payAssignments = await PaymentAssignmentSchema.find({ 'user._id': idUser }).session(session);
  return payAssignments.length > 0;
};

export {
  createPayment,
  assignPaymentToUsers,
  assignPaymentToUser,
  deletePaymentAssignment,
  getPaymentAssignmetById,
  completePayment,
  resetPaymentCompletedStatus,
  confirmPayment,
  updatePayment,
  getPaymentsWhereUserIsTreasurer,
  getPaymentById,
  updatePaymentInAllDependencies,
  deletePayment,
  deleteAllPaymentAssignments,
  removePaymentDependencies,
  verifyIfUserIsTreasurer,
  getPaymentAssignments,
  hasPaymentsAsTreasurer,
  verifyIfUserHasPaymentAssignments,
};

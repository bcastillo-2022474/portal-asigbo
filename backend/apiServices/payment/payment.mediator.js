import consts from '../../utils/consts.js';
import { forceSessionTokenToUpdate } from '../session/session.model.js';
import { addRoleToUser, getUsersInList } from '../user/user.model.js';
import { createPayment as createPaymentModel } from './payment.model.js';

const addTreasurerRole = async ({ idUser, session }) => {
  const roleAdded = await addRoleToUser({ idUser, role: consts.roles.treasurer, session });
  if (roleAdded) await forceSessionTokenToUpdate({ idUser, session });
};

const createPayment = async ({
  name, limitDate, amount, description, treasurerUsersId, targetUsers, activityPayment, session,
}) => {
  // Obtener objetos de usuarios tesoreros
  const treasurerUsers = await getUsersInList({ idUsersList: treasurerUsersId, session, missingUserError: 'Uno de los usuarios especificados como tesoreros no existe.' });

  // Crear pago
  const payment = await createPaymentModel({
    name, limitDate, amount, description, treasurer: treasurerUsers, targetUsers, activityPayment, session,
  });

  // Asignar role de tesorero
  await Promise.all(treasurerUsersId.map((idUser) => addTreasurerRole({ idUser, session })));

  return payment;
};

// eslint-disable-next-line import/prefer-default-export
export { createPayment };

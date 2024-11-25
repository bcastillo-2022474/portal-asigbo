import yup from 'yup';
import validateId from '../../../utils/validateId.js';

const paymentAssignmentParamSchema = yup.object().shape({
  idPaymentAssignment: yup
    .string()
    .nullable()
    .test('validate-id', 'El id de la asignación de pago no es un id válido.', (id) => validateId(id)),
});

export default paymentAssignmentParamSchema;

import yup from 'yup';
import validateId from '../../../utils/validateId.js';

const paymentParamSchema = yup.object().shape({
  idPayment: yup
    .string()
    .nullable()
    .test('validate-id', 'El id del pago no es un id válido.', (id) => validateId(id)),
});

export default paymentParamSchema;

import yup from 'yup';
import validateId from '../../../utils/validateId.js';

export default yup.object().shape({
  idUser: yup
    .string()
    .nullable()
    .test('validate-id', 'El id del usuario no es un id válido.', (id) => validateId(id)),
});

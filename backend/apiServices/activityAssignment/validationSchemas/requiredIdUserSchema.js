import yup from 'yup';
import validateId from '../../../utils/validateId.js';

export default yup.object().shape({
  idUser: yup
    .string()
    .nullable()
    .required("El campo 'idUser' es obligatorio.")
    .test('validate-id', "El campo 'idUser' no es un id válido.", (id) => validateId(id)),
});

export const optionalIdUserSchema = yup.object().shape({
  idUser: yup
    .string()
    .nullable()
    .test('validate-id', "El campo 'idUser' no es un id válido.", (id) => validateId(id)),
});

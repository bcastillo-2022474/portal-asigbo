import * as yup from 'yup';
import validateId from '../../../utils/validateId.js';

export default yup.object().shape({
  idUser: yup
    .string()
    .required("El campo 'idUser' es obligatorio.")
    .test('validate-id', "El campo 'idUser' no es un id válido.", (id) => validateId(id)),
});

import yup from 'yup';
import validateId from '../../../utils/validateId.js';

export default yup.object().shape({
  idUser: yup
    .string()
    .nullable()
    .test('validate-id', "El campo 'idUser' no es un id válido.", (id) => id === undefined || validateId(id)),
  idActivity: yup
    .string()
    .nullable()
    .test('validate-id', "El campo 'idActivity' no es un id válido.", (id) => id === undefined || validateId(id)),
});

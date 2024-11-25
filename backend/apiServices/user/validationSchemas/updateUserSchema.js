import yup from 'yup';
import validateId from '../../../utils/validateId.js';

const updateUserBodySchema = yup.object().shape({
  removeProfilePicture: yup
    .bool()
    .nullable()
    .typeError("El campo 'removeProfilePicture' debe tener un valor booleano."),
  sex: yup.string().matches(/^[MF]$/, "El campo 'sex' debe ser 'M' o 'F'."),
  code: yup
    .number()
    .nullable()
    .typeError("El campo 'code' debe ser un número.")
    .integer("El campo 'code' debe ser un número entero."),
  promotion: yup
    .number()
    .nullable()
    .typeError("El campo 'promotion' debe ser un número.")
    .integer("El campo 'promotion' debe ser un número entero.")
    .min(2000, "El campo 'promotion' debe ser mayor a 2000")
    .max(2100, "El campo 'promotion' debe ser menor o igual a 2100"),
  career: yup.string(),
  university: yup.string(),
  campus: yup.string(),
  email: yup
    .string()
    .nullable()
    .email("El valor de 'email' no posee el formato de una email válido."),
  lastname: yup.string(),
  name: yup.string(),
});

const updateUserParamsSchema = yup.object().shape({
  idUser: yup
    .string()
    .nullable()
    .test('validate-id', 'El id del usuario no es un id válido.', (id) => validateId(id)),
});

export { updateUserBodySchema, updateUserParamsSchema };

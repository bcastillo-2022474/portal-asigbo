import * as yup from 'yup';

const updateUserSchema = yup.object().shape({

  sex: yup.string().matches(/^[MF]$/, "El campo 'sex' debe ser 'M' o 'F'.").required('Debes seleccionar el sexo del usuario.'),
  promotion: yup
    .number()
    .nullable()
    .typeError('La promoción debe ser un número.')
    .integer('La promoción debe ser un número entero.')
    .min(2000, 'La promoción debe ser mayor a 2000')
    .max(2100, 'La promoción debe ser menor o igual a 2100')
    .required('Debes ingresar la promoción del usuario.'),
  career: yup.string().required('Debes ingresar la carrera.'),
  email: yup
    .string()
    .nullable()
    .email('Ingresar un email válido.')
    .required('Debes ingresar el email del usuario.'),
  lastname: yup.string().min(1, 'Debes ingresar el apellido.').required('Debes ingresar el apellido.'),
  name: yup.string().min(1, 'Debes ingresar el nombre.').required('Debes ingresar el nombre.'),
});

export default updateUserSchema;

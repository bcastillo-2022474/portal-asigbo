import * as yup from 'yup';

const updateUserSchema = yup.object().shape({
  password: yup
    .string(),
  repeatPassword: yup
    .string()
    .when('password', (password, schema) => {
      if (password?.[0] && password[0]?.length > 0) {
        return schema.required('Debes ingresar de nuevo tu contraseña.')
          .test('min-length', 'Debes ingresar de nuevo tu contraseña.', (value) => value?.length > 0)
          .oneOf([yup.ref('password')], 'Las contraseñas no coinciden.');
      }
      return schema;
    }),
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
  campus: yup.string().required('Debes ingresar el campus de la universidad.'),
  university: yup.string().required('Debes ingresar la universidad.'),
  email: yup
    .string()
    .nullable()
    .trim()
    .email('Ingresar un email válido.')
    .required('Debes ingresar el email del usuario.'),
  lastname: yup.string().min(1, 'Debes ingresar el apellido.').required('Debes ingresar el apellido.'),
  name: yup.string().min(1, 'Debes ingresar el nombre.').required('Debes ingresar el nombre.'),
});

export default updateUserSchema;

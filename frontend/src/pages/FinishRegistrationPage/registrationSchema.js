import * as yup from 'yup';

export default yup.object().shape({
  repeatPassword: yup
    .string()
    .nullable()
    .required('Debes ingresar de nuevo tu contraseña.')
    .oneOf([yup.ref('password'), null], 'Las contraseñas no coinciden.')
    .test('min-length', 'Debes ingresar de nuevo tu contraseña.', (value) => value?.length > 0),
  password: yup
    .string()
    .required('Debes ingresar tu contraseña.')
    .test('min-length', 'Debes ingresar tu contraseña.', (value) => value?.length > 0),
});

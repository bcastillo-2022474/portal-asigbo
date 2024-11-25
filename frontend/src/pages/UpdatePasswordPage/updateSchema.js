import * as yup from 'yup';

export default yup.object().shape({
  repeatPassword: yup
    .string()
    .nullable()
    .required('Debes ingresar tu nueva contraseña una vez más.')
    .oneOf([yup.ref('password'), null], 'Las contraseñas no coinciden.')
    .test('min-length', 'Debes ingresar tu nueva contraseña una vez más.', (value) => value?.length > 0),
  password: yup
    .string()
    .required('Debes ingresar tu nueva contraseña.')
    .test('min-length', 'Debes ingresar tu nueva contraseña.', (value) => value?.length > 0),
});

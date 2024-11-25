import yup from 'yup';

export default yup
  .object()
  .shape({
    password: yup.string().required("El campo 'password' es obligatorio."),
    user: yup.string().required("El campo 'user' es obligatorio."),
  });

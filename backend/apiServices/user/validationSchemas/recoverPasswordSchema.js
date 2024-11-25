import yup from 'yup';

export default yup.object().shape({
  email: yup
    .string()
    .nullable()
    .email("El valor de 'email' no posee el formato de una email válido.")
    .required("El campo 'email' es obligatorio."),
});

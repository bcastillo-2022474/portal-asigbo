import yup from 'yup';

export default yup.object().shape({
  sex: yup
    .string()
    .matches(/^[MF]$/, "El campo 'sex' debe ser 'M' o 'F'.")
    .required("El campo 'sex' es obligatorio."),
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
    .max(2100, "El campo 'promotion' debe ser menor o igual a 2100")
    .required("El campo 'promotion' es obligatorio."),
  career: yup
    .string()
    .required("El campo 'career' es obligatorio"),
  university: yup
    .string()
    .required("El campo 'university' es obligatorio"),
  campus: yup
    .string()
    .required("El campo 'campus' es obligatorio"),
  email: yup
    .string()
    .nullable()
    .email("El valor de 'email' no posee el formato de una email válido.")
    .required("El campo 'email' es obligatorio."),
  lastname: yup.string().required("El campo 'lastname' es obligatorio."),
  name: yup.string().required("El campo 'name' es obligatorio."),
});

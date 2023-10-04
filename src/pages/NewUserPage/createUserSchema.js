import * as yup from 'yup';

export default yup.object().shape({
  sex: yup
    .string()
    .matches(/^[MF]$/, "El campo 'sex' debe ser 'M' o 'F'.")
    .required("El campo 'Sexo' es obligatorio."),
  code: yup
    .number()
    .nullable()
    .typeError("El campo 'code' debe ser un número.")
    .integer("El campo 'code' debe ser un número entero."),
  promotion: yup
    .number()
    .nullable()
    .typeError('La promoción del becado debe ser un número.')
    .integer('La promoción del becado debe ser un número entero.')
    .min(2000, 'La promoción del becado  debe ser mayor a 2000')
    .max(2100, 'La promoción del becado debe ser menor o igual a 2100')
    .required('Se requiere la promoción del becado.'),
  career: yup
    .string()
    .required('Se requiere la carrera del becado'),
  email: yup
    .string()
    .nullable()
    .email('El correo electrónico no posee el formato de una email válido.')
    .required('Se requiere el correo electrónico del becado.'),
  lastname: yup.string().required('Se requieren los apellidos del becado.'),
  name: yup.string().required('Se requieren los nombres del becado.'),
});

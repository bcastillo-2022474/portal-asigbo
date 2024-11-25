import yup from 'yup';

export default yup.object().shape({
  filesToRemove: yup
    .array()
    .of(yup.string().nullable())
    .nullable()
    .typeError("El campo 'filesToRemove' debe ser un arreglo de strings."),
  notes: yup.string().nullable().typeError("El campo 'notes' debe ser un texto."),
  completed: yup.bool().nullable().typeError("El campo 'completed' debe ser un valor booleano."),
  aditionalServiceHours: yup
    .number()
    .nullable()
    .typeError("El campo 'aditionalServiceHours' debe ser un número.")
    .integer("El campo 'aditionalServiceHours' debe ser un número entero.")
    .min(0, "El campo 'aditionalServiceHours' debe ser mayor o igual a 0."),
});

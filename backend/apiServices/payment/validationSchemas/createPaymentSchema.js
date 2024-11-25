import yup from 'yup';
import validateId from '../../../utils/validateId.js';

export default yup.object().shape({
  promotion: yup.mixed()
    .test(
      'is-string-or-number',
      "El campo 'promotion' debe ser una cadena o un número.",
      (value) => typeof value === 'string' || typeof value === 'number',
    )
    .required("El campo 'promotion' es obligatorio."),
  treasurer: yup
    .array()
    .of(
      yup
        .string()
        .test('validate-id', "El campo 'treasurer' debe contener id's válidos.", (id) => validateId(id)),
    )
    .typeError("El campo 'treasurer' debe ser un arreglo.")
    .min(1, "El campo 'treasurer' debe contener al menos un responsable del área.")
    .required("El campo 'treasurer' es oblgatorio."),
  limitDate: yup
    .date()
    .nullable()
    .typeError("El campo 'limitDate' debe ser una fecha válida.")
    .required("El campo 'limitDate' es obligatorio."),
  description: yup.string().required("El campo 'description' es obligatorio."),
  amount: yup
    .number()
    .nullable()
    .typeError("El campo 'amount' debe ser una número.")
    .min(0, "El campo 'amount' debe ser mayor o igual a cero.")
    .required("El campo 'amount' es obligatorio."),
  name: yup.string().required("El campo 'name' es obligatorio."),
});

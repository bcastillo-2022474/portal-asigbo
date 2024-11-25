import yup from 'yup';
import validateId from '../../../utils/validateId.js';

export default yup.object().shape({
  treasurer: yup
    .array()
    .of(
      yup
        .string()
        .test('validate-id', "El campo 'treasurer' debe contener id's válidos.", (id) => validateId(id)),
    )
    .typeError("El campo 'treasurer' debe ser un arreglo.")
    .min(1, "El campo 'treasurer' debe contener al menos un responsable del área."),
  limitDate: yup
    .date()
    .nullable()
    .typeError("El campo 'limitDate' debe ser una fecha válida."),
  description: yup.string(),
  amount: yup
    .number()
    .nullable()
    .typeError("El campo 'amount' debe ser una número.")
    .min(0, "El campo 'amount' debe ser mayor o igual a cero."),
  name: yup.string(),
});

import yup from 'yup';
import validateId from '../../../utils/validateId.js';

export default yup.object().shape({
  completed: yup.bool().nullable().typeError("El campo 'completed' debe ser un valor booleano."),
  idActivity: yup
    .string()
    .nullable()
    .required("El campo 'idActivity' es obligatorio.")
    .test('validate-id', "El campo 'idActivity' no es un id válido.", (id) => validateId(id)),
  idUsersList: yup
    .array()
    .of(
      yup
        .string()
        .test('validate-id', "El campo 'idUsersList' debe contener id's válidos.", (id) => validateId(id)),
    )
    .min(1, "El campo 'idUsersList' debe tener al menos un elemento.")
    .nullable()
    .typeError("El campo 'idUsersList' debe ser una lista.")
    .required("El campo 'idUsersList' es obligatorio."),
});

import yup from 'yup';
import validateHexColor from '../../../utils/validateHexColor.js';
import validateId from '../../../utils/validateId.js';

export default yup.object().shape({
  name: yup.string().required("El campo 'name' es obligatorio."),
  color: yup
    .string()
    .test(
      'valid-hex-color',
      "El campo 'color' debe ser un color hexadecimal válido.",
      (value) => validateHexColor(value),
    )
    .required("El campo 'color' es obligatorio."),
  responsible: yup
    .array()
    .of(
      yup
        .string()
        .test('validate-id', "El campo 'responsible' debe contener id's válidos.", (id) => validateId(id)),
    )
    .typeError("El campo 'responsible' debe ser un arreglo.")
    .min(1, "El campo 'responsible' debe contener al menos un responsable del área.")
    .required("El campo 'responsible' es oblgatorio."),
});

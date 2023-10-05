import * as yup from 'yup';

export default yup.object().shape({
  name: yup
    .string()
    .min(5, 'El nombre del eje debe tener un largo de al menos 5 caracteres.')
    .required('El nombre del eje es obligatorio.'),
  responsible: yup
    .array()
    .typeError("El campo 'responsible' debe ser un arreglo.")
    .min(1, 'Debe especificar al menos un responsable del área.')
    .required('Debe especificar a los encargados de esta área.'),
});

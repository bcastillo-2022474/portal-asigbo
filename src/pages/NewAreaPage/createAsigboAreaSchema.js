import * as yup from 'yup';

export default yup.object().shape({
  name: yup.string().required('El nombre del área es obligatorio.'),
  icon: yup.mixed().required('Debes agregar un ícono.'),
  responsible: yup
    .array()
    .typeError("El campo 'responsible' debe ser un arreglo.")
    .min(1, 'Debe especificar al menos un responsable del área.')
    .required('Debe especificar a los encargados de esta área.'),
});

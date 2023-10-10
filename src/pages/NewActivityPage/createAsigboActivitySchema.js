import * as yup from 'yup';

export default yup.object().shape({
  activityName: yup
    .string()
    .required('El nombre del la actividad es obligatoria.'),
  completionDate: yup
    .date()
    .required('La fecha de realización es obligatoria.'),
  serviceHours: yup
    .number()
    .required('La cantidad de horas de servicio es obligatoria.'),
  maxParticipants: yup
    .number()
    .required('La cantidad máxima de participantes es obligatoria.'),
  paymentRequired: yup
    .number()
    .required('El monto de pago es obligatorio.'),
  responsible: yup
    .array()
    .typeError("El campo 'responsible' debe ser un arreglo.")
    .min(1, 'Debe especificar al menos un responsable del área.')
    .required('Debe especificar a los encargados de esta área.'),
});

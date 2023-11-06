import * as yup from 'yup';

export default yup.object().shape({
  activityName: yup
    .string()
    .required('El nombre del la actividad es obligatoria.'),
  completionDate: yup
    .date()
    .required('La fecha de realización es obligatoria.'),
  registrationStartDate: yup
    .date()
    .required('La fecha "Disponible desde" es obligatoria.')
    .when('completionDate', (completionDate, schema) => schema.test({
      // eslint-disable-next-line max-len
      test: (registrationStartDate) => new Date(registrationStartDate).getTime() <= new Date(completionDate).getTime(),
      message: 'La fecha "Disponible desde" no puede ser posterior a la "Fecha de realización".',
    })),
  registrationEndDate: yup
    .date()
    .required('La fecha "Disponible hasta" es obligatoria.')
    .when('completionDate', (completionDate, schema) => schema.test({
      // eslint-disable-next-line max-len
      test: (registrationEndDate) => new Date(registrationEndDate).getTime() <= new Date(completionDate).getTime(),
      message: 'La fecha "Disponible hasta" no puede ser posterior a la "Fecha de realización".',
    }))
    .when('registrationStartDate', (registrationStartDate, schema) => schema.test({
      // eslint-disable-next-line max-len
      test: (registrationEndDate) => new Date(registrationEndDate).getTime() >= new Date(registrationStartDate).getTime(),
      message: 'La fecha "Disponible hasta" no puede ser anterior a "Disponible desde".',
    })),
  serviceHours: yup
    .number()
    .min(0, 'Las horas de servicio deben ser un número positivo o cero.')
    .integer('Las horas de servicio deben ser un número entero.')
    .typeError('Debes ingresar un valor numérico.')
    .required('La cantidad de horas de servicio es obligatoria.'),
  maxParticipants: yup
    .number()
    .positive('El número de personas debe ser un número positivo.')
    .typeError('Debes ingresar un valor numérico.')
    .required('La cantidad máxima de participantes es obligatoria.'),
  responsible: yup
    .array()
    .typeError("El campo 'responsible' debe ser un arreglo.")
    .min(1, 'Debe especificar al menos un responsable de actividad.')
    .required('Debe especificar a los encargados de esta actividad.'),
});

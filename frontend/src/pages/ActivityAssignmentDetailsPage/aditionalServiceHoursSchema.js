import * as yup from 'yup';

export default yup.object().shape({
  aditionalServiceHours: yup
    .number()
    .nullable()
    .typeError('Las horas de servicio adicionales deben ser un número.')
    .integer('Las horas de servicio adicionales deben ser un entero.')
    .min(0, 'Las horas de servicio adicionales deben ser mayores o iguales a cero.')
    .required('Ingresa un valor.'),
});

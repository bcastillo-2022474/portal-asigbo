import * as yup from 'yup';

export default yup.object().shape({
  firstYearPromotion: yup
    .number()
    .typeError('El año de promoción debe ser un número.')
    .integer('El año de promoción debe ser un número entero.')
    .min(2000, 'El año de promoción debe ser mayor a 2000')
    .max(2100, 'El año de promoción debe ser menor o igual a 2100')
    .required('Se requiere el año de promoción más reciente.'),
  lastYearPromotion: yup
    .number()
    .typeError('El año de promoción debe ser un número.')
    .integer('El año de promoción debe ser un número entero.')
    .min(2000, 'El año de promoción debe ser mayor a 2000')
    .max(2100, 'El año de promoción debe ser menor o igual a 2100')
    .required('Se requiere el último año de promoción actual.'),
}).test(
  'lastYearGreater',
  "El campo 'lastYearPromotion' debe ser menor al campo 'firstYearPromotion'.",
  (value, ctx) => {
    const { firstYearPromotion, lastYearPromotion } = value;
    const isValid = !(firstYearPromotion <= lastYearPromotion);

    if (isValid) return true;
    return ctx.createError({
      path: 'lastYearGreater',
      message: 'La promoción de primer año debe ser menor a la promoción del último año',
    });
  },
);

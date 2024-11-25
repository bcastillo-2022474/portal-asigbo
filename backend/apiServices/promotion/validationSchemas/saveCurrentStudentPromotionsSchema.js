import yup from 'yup';

export default yup.object().shape({
  lastYearPromotion: yup
    .number()
    .typeError("El campo 'lastYearPromotion' debe contener solo números.")
    .integer("El campo 'lastYearPromotion' debe contener solo números enteros.")
    .min(2000, "El campo 'lastYearPromotion' debe contener valores mayores o iguales a 2000")
    .max(2100, "El campo 'lastYearPromotion' debe contener valores menores o iguales a 2100")
    .required("El campo 'lastYearPromotion' es obligatorio."),
  firstYearPromotion: yup
    .number()
    .typeError("El campo 'firstYearPromotion' debe contener solo números.")
    .integer("El campo 'firstYearPromotion' debe contener solo números enteros.")
    .min(2000, "El campo 'firstYearPromotion' debe contener valores mayores o iguales a 2000")
    .max(2100, "El campo 'firstYearPromotion' debe contener valores menores o iguales a 2100")
    .required("El campo 'firstYearPromotion' es obligatorio."),

})
  .test(
    'lastYearGreater',
    "El campo 'lastYearPromotion' debe ser menor al campo 'firstYearPromotin'.",
    (value) => {
      const { firstYearPromotion, lastYearPromotion } = value;
      return !(firstYearPromotion <= lastYearPromotion);
    },
  );

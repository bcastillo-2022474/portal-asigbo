import yup from 'yup';
import validateId from '../../../utils/validateId.js';
import consts from '../../../utils/consts.js';

export default yup.object().shape({
  registrationAvailable: yup.boolean()
    .nullable()
    .typeError("El campo 'registrationAvailable' debe tener un valor booleano.'")
    .required("El campo 'registrationAvailable' es obligatorio."),
  participantsNumber: yup
    .number()
    .nullable()
    .typeError("El campo 'participantsNumber' debe ser un número.")
    .integer("El campo 'participantsNumber' debe ser un número entero.")
    .min(0, "El campo 'participantsNumber' debe contener valores mayores o iguales a 0.")
    .required("El campo 'participantsNumber' es obligatorio."),
  participatingPromotions: yup
    .array()
    .transform((value, originalValue) => {
    // Si el valor original es "null", convertirlo a null
      if (originalValue === 'null') return null;
      return originalValue;
    })
    .nullable()
    .of(
      yup.lazy((value) => {
        if (!Number.isNaN(parseInt(value, 10))) {
          return yup
            .number()
            .integer("El campo 'participatingPromotions' debe contener solo números enteros.")
            .min(2000, "El campo 'participatingPromotions' debe contener valores mayores o iguales a 2000")
            .max(2100, "El campo 'participatingPromotions' debe contener valores menores o iguales a 2100");
        }
        return yup
          .string()
          .oneOf(Object.values(consts.promotionsGroups), "El campo 'participatingPromotions' contiene valores no numéricos que no corresponden a un grupo de promociones.");
      }),
    )
    .typeError("El campo 'participatingPromotions' debe ser una lista."),
  registrationEndDate: yup
    .date()
    .typeError("El campo 'registrationEndDate' debe ser una fecha.")
    .nullable()
    .required("El campo 'registrationEndDate' es obligatorio."),
  registrationStartDate: yup
    .date()
    .typeError("El campo 'registrationStartDate' debe ser una fecha.")
    .nullable()
    .required("El campo 'registrationStartDate' es obligatorio."),
  idAsigboArea: yup
    .string()
    .nullable()
    .required("El campo 'idAsigboArea' es obligatorio.")
    .test(
      'validate-id',
      "El campo 'idAsigboArea' no es un id válido.",
      (id) => validateId(id),
    ),
  responsible: yup
    .array()
    .of(
      yup
        .string()
        .test('validate-id', "El campo 'responsible' debe contener id's válidos.", (id) => validateId(id)),
    )
    .min(1, "El campo 'responsible' debe tener al menos un elemento.")
    .nullable()
    .typeError("El campo 'responsible' debe ser una lista.")
    .required("El campo 'responsible' es obligatorio."),
  serviceHours: yup
    .number()
    .nullable()
    .typeError("El campo 'serviceHours' debe ser un número.")
    .integer("El campo 'serviceHours' debe ser un número entero.")
    .min(0, "El campo 'serviceHours' debe ser mayor o igual a 0.")
    .max(200, "El campo 'serviceHours' debe ser menor o igual a 200.")
    .required("El campo 'serviceHours' es obligatorio."),
  date: yup
    .date()
    .typeError("El campo 'date' debe ser una fecha.")
    .nullable()
    .required("El campo 'date' es obligatorio."),
  description: yup.string().nullable().required("El campo 'description' es obligatorio."),
  name: yup.string().nullable().required("El campo 'name' es obligatorio."),
});

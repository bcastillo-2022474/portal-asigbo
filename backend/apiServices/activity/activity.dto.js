import { parseMultipleObjects } from '../../utils/parseMongoObject.js';
import { single as asigboAreaSingle } from '../asigboArea/asigboArea.dto.js';
import { singlePaymentDto } from '../payment/payment.dto.js';

/**
 * Genera el dto para una actividad.
 * @param resource. Objeto con la información del dto.
 * @param Options. Object {showSensitiveData: Bool. Mostrar información sensible * }
 * @returns
 */
const single = (
  resource,
  { showSensitiveData } = {},
) => {
  const {
    id,
    _id,
    name,
    date,
    description,
    serviceHours,
    responsible,
    asigboArea,
    payment,
    registrationStartDate,
    registrationEndDate,
    participatingPromotions,
    participantsNumber,
    maxParticipants,
    blocked,
    hasBanner,
    registrationAvailable,
  } = resource._doc ?? resource;
  return {
    id: resource._id?.valueOf() ?? _id?.valueOf() ?? id,
    _id: resource._id?.valueOf() ?? _id?.valueOf() ?? id,
    name,
    date,
    description,
    serviceHours,
    responsible: showSensitiveData ? parseMultipleObjects(responsible) : undefined,
    asigboArea: asigboAreaSingle(asigboArea),
    payment: payment ? singlePaymentDto(payment) : undefined,
    registrationStartDate,
    registrationEndDate,
    participatingPromotions: showSensitiveData ? participatingPromotions : undefined,
    participantsNumber,
    maxParticipants,
    availableSpaces: (maxParticipants ?? 0) - (participantsNumber ?? 0),
    blocked,
    hasBanner,
    registrationAvailable,
  };
};

const multiple = (resources, { showSensitiveData } = {}) => resources.map((resource) => single(resource, { showSensitiveData }));

export { single, multiple };

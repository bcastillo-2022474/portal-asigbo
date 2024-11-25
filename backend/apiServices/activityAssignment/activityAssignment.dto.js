import { single as activitySingle } from '../activity/activity.dto.js';
import { singlePaymentAssignmentDto } from '../payment/paymentAssignment.dto.js';
import { single as userSingle } from '../user/user.dto.js';

const single = (resource, { showSensitiveData = false } = {}) => {
  const {
    _id, id, user, activity, paymentAssignment, completed, aditionalServiceHours, files, notes,
  } = resource?._doc ?? resource;
  return {
    id: _id?.valueOf() ?? id,
    _id: _id?.valueOf() ?? id,
    user: userSingle(user),
    activity: activitySingle(activity),
    paymentAssignment: singlePaymentAssignmentDto(paymentAssignment),
    completed,
    aditionalServiceHours,
    files: showSensitiveData ? files : undefined,
    notes: showSensitiveData ? notes : undefined,
  };
};

const multiple = (resources, { showSensitiveData } = {}) => resources.map((resource) => single(resource, { showSensitiveData }));

export { single, multiple };

import exists from '../../utils/exists.js';

const parseServiceHours = (serviceHours) => {
  const areas = serviceHours?.areas?.map((val) => {
    const {
      asigboArea: {
        _id, id, name, color,
      },
      total,
    } = val;
    return {
      asigboArea: {
        _id, id, name, color,
      },
      total,
    };
  });
  return { areas, total: serviceHours?.total, activitiesCompleted: serviceHours?.activitiesCompleted };
};

const single = (
  resource,
  { showSensitiveData = false, showHours = false, showRole = false } = {},
) => {
  const {
    code,
    name,
    lastname,
    university,
    campus,
    email,
    promotion,
    career,
    sex,
    serviceHours,
    blocked,
    role,
    passwordHash,
    hasImage,
    completeRegistration,
  } = resource?._doc ?? resource;
  return {
    id: resource?._id?.valueOf() ?? resource.id,
    _id: resource?._id?.valueOf() ?? resource.id,
    code,
    name,
    lastname,
    university,
    campus,
    email: showSensitiveData ? email : undefined,
    promotion,
    career,
    sex,
    serviceHours: showSensitiveData || showHours ? parseServiceHours(serviceHours) : undefined,
    blocked: showSensitiveData ? blocked : undefined,
    role: showSensitiveData || showRole ? role : undefined,
    completeRegistration: showSensitiveData ? (completeRegistration || exists(passwordHash)) : undefined,
    hasImage,
  };
};

const multiple = (resources, { showSensitiveData, showHours, showRole } = {}) => resources?.map((resource) => single(resource, { showSensitiveData, showHours, showRole }));

export { single, multiple };

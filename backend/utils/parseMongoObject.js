const parseSingleObject = (resource) => {
  if (!resource) return null;
  const data = resource._doc ?? resource;
  const res = {
    id: resource._id?.valueOf() ?? resource?.id,
    ...data,
  };
  delete res._id;
  return res;
};

const parseMultipleObjects = (resources) => resources.map((resource) => parseSingleObject(resource));

export { parseSingleObject, parseMultipleObjects };

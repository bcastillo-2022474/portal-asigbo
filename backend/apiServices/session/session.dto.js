const single = (resource) => {
  const {
    code, name, lastname, promotion, career, sex, role, hasImage,
  } = resource._doc;
  return {
    id: resource._id.valueOf(),
    code,
    name,
    lastname,
    promotion,
    career,
    sex,
    role,
    hasImage,
  };
};

export default single;

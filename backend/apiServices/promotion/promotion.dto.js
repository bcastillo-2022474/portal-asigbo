const single = (resource) => {
  const {
    firstYearPromotion, lastYearPromotion, id,
  } = resource._doc;
  return {
    id: resource._id.valueOf() ?? id,
    firstYearPromotion,
    lastYearPromotion,
  };
};

const multiple = (resources) => resources.map((resource) => single(resource));

export { single, multiple };

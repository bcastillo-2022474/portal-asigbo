import { ObjectId } from 'mongodb';

const compareObjectId = (val1, val2) => {
  const firstValue = val1 instanceof ObjectId ? val1.toString() : val1;
  const secondValue = val2 instanceof ObjectId ? val2.toString() : val2;
  return firstValue === secondValue;
};

export default compareObjectId;

import { Schema } from 'mongoose';
import { ObjectId } from 'mongodb';

const userSubSchema = Schema({
  _id: { type: ObjectId, ref: 'user', required: true },
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  promotion: { type: Number, required: true },
  hasImage: { type: Boolean, required: true },
});

export default userSubSchema;

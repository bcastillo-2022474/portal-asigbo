import { Schema, model } from 'mongoose';
import { asigboAreaSubSchema } from './asigboArea.schema.js';

const AreaServiceHoursSchema = Schema({
  asigboArea: { type: asigboAreaSubSchema, required: true },
  total: { type: Number, default: 0 },
});

const userSchema = Schema({
  code: { type: Number, unique: true, required: false },
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  university: { type: String, required: true },
  campus: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  promotion: { type: Number, required: true },
  career: { type: String, required: true },
  role: {
    type: [{
      type: String,
      required: true,
    }],
  },
  passwordHash: { type: String },
  serviceHours: {
    areas: [{ type: AreaServiceHoursSchema }],
    total: { type: Number, default: 0 },
    activitiesCompleted: { type: Number, default: 0 },
  },
  blocked: { type: Boolean, default: false },
  sex: { type: String, required: true },
  hasImage: { type: Boolean, default: false },
});

userSchema.index({ name: 'text', lastname: 'text' });

const UserSchema = model('user', userSchema);
export default UserSchema;

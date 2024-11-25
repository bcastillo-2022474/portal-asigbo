import { Schema, model } from 'mongoose';
import { ObjectId } from 'mongodb';
import userSubSchema from './subUser.schema.js';

const asigboAreaSchema = Schema({
  name: { type: String, required: true, unique: true },
  responsible: {
    type: [userSubSchema],
    required: true,
    validate: {
      validator(responsibles) {
        return responsibles.length > 0;
      },
      message: 'Debe proporcionar al menos un encargado de área.',
    },
  },
  color: { type: String, required: true },
  blocked: { type: Boolean, default: false },
});
const asigboAreaSubSchema = Schema({
  _id: { type: ObjectId, ref: 'asigboArea', required: true },
  name: { type: String, required: true },
  blocked: { type: Boolean, default: false },
  color: { type: String, required: true },
});

const AsigboAreaSchema = model('asigboArea', asigboAreaSchema);
export default AsigboAreaSchema;
export { asigboAreaSubSchema };

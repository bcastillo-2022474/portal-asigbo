import { ObjectId } from 'mongodb';
import { Schema, model } from 'mongoose';
import userSubSchema from './subUser.schema.js';

const paymentSchema = Schema({
  name: { type: String, required: true },
  limitDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  treasurer: {
    type: [userSubSchema],
    required: true,
    validate: {
      validator(responsibles) {
        return responsibles.length > 0;
      },
      message: 'Debe proporcionar al menos un tesorero.',
    },
  },
  targetUsers: { type: String, required: true },
  activityPayment: { type: Boolean, default: false },
});

const paymentSubSchema = Schema({
  _id: { type: ObjectId, ref: 'payment', required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  limitDate: { type: Date, required: true },
  description: { type: String, required: true },
});

const PaymentSchema = model('payment', paymentSchema);
export default PaymentSchema;
export { paymentSubSchema };

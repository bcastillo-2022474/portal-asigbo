import { Schema, model } from 'mongoose';
import { ObjectId } from 'mongodb';
import userSubSchema from './subUser.schema.js';
import { paymentSubSchema } from './payment.schema.js';

const paymentAssignmentSchema = Schema({
  user: { type: userSubSchema, required: true },
  payment: { type: paymentSubSchema, required: true },
  vouchersKey: { type: [String] },
  completed: { type: Boolean, default: false },
  confirmed: { type: Boolean, default: false },
  completedDate: { type: Date },
  confirmedDate: { type: Date },
  treasurer: { type: userSubSchema },
});

const paymentAssignmentSubSchema = Schema({
  _id: { type: ObjectId, ref: 'paymentAssignment', required: true },
  idPayment: { type: ObjectId, ref: 'payment', required: true },
  completed: { type: Boolean, default: false },
  confirmed: { type: Boolean, default: false },
  completedDate: { type: Date },
  confirmedDate: { type: Date },
});

const PaymentAssignmentSchema = model('paymentAssignment', paymentAssignmentSchema);
export default PaymentAssignmentSchema;
export { paymentAssignmentSubSchema };

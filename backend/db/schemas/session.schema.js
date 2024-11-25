import { Schema, model } from 'mongoose';
import { ObjectId } from 'mongodb';

const sessionSchema = Schema({
  idUser: { type: ObjectId, ref: 'user', required: true },
  token: { type: String, required: true },
  tokenType: { type: String, required: true },
  linkedToken: { type: String },
  needUpdate: { type: Boolean, default: false },
  date: { type: Date, required: true },
});

const SessionSchema = model('session', sessionSchema);
export default SessionSchema;

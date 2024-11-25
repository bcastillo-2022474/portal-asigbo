import { Schema, model } from 'mongoose';
import { ObjectId } from 'mongodb';

const alterUserTokenSchema = Schema({
  idUser: {
    type: ObjectId, ref: 'user', required: true, unique: true,
  },
  token: { type: String, required: true },
  tokenType: { type: String, required: true },
  date: { type: Date, required: true },
});

const AlterUserTokenSchema = model('alterUserToken', alterUserTokenSchema);
export default AlterUserTokenSchema;

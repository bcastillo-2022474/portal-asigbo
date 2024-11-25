import { Schema, model } from 'mongoose';

const promotionSchema = Schema({
  firstYearPromotion: {
    type: Number,
    required: true,
    min: [2000, 'El valor mínimo de una promoción es 2000.'],
    max: [2100, 'El valor máximo de una promoción es 2100.'],
  },
  lastYearPromotion: {
    type: Number,
    required: true,
    min: [2000, 'El valor mínimo de una promoción es 2000.'],
    max: [2100, 'El valor máximo de una promoción es 2100.'],
    validate: {
      validator(value) {
        return value < this.firstYearPromotion;
      },
      message: 'La promocion de último año debe ser menor a la de primero.',
    },
  },
});

const PromotionSchema = model('promotion', promotionSchema);
export default PromotionSchema;

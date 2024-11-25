import PromotionSchema from '../../db/schemas/promotion.schema.js';
import consts from '../../utils/consts.js';
import CustomError from '../../utils/customError.js';
import { single } from './promotion.dto.js';

const validateResponsible = async ({ idUser, promotion }) => {
  const { responsible } = await PromotionSchema.findOne({ lastYearPromotion: promotion });
  return responsible.some((user) => user._id.toString() === idUser);
};

const saveCurrentStudentPromotions = async ({ firstYearPromotion, lastYearPromotion }) => {
  const promotionsData = (await PromotionSchema.findOne()) || new PromotionSchema();

  promotionsData.firstYearPromotion = firstYearPromotion;
  promotionsData.lastYearPromotion = lastYearPromotion;

  const result = await promotionsData.save();
  return single(result);
};

class Promotion {
  async getFirstAndLastYearPromotion() {
    if (this.promotion) return this.promotion;
    const currentStudents = await PromotionSchema.findOne();
    if (currentStudents === null) {
      throw new CustomError('No se ha configurado las promociones de estudiantes.', 400);
    }
    this.promotion = single(currentStudents);
    return this.promotion;
  }

  async getPromotionGroup(promotion) {
    const { firstYearPromotion, lastYearPromotion } = await this.getFirstAndLastYearPromotion();
    if (promotion < lastYearPromotion) return consts.promotionsGroups.graduate;
    if (promotion > firstYearPromotion) return consts.promotionsGroups.chick;
    return consts.promotionsGroups.student;
  }

  async getPromotionsGroups() {
    const { firstYearPromotion, lastYearPromotion } = await this.getFirstAndLastYearPromotion();

    const studentPromotions = [];
    for (let i = firstYearPromotion; i >= lastYearPromotion; i -= 1) {
      studentPromotions.push(i);
    }

    return {
      notStudents: [consts.promotionsGroups.chick, consts.promotionsGroups.graduate],
      students: { id: consts.promotionsGroups.student, years: studentPromotions },
    };
  }

  /**
   * Este método se utiliza para obtener los valores min y max  de los años de un determinado grupo de promociones.
   * Ejemplo: los pollitos son todas las promociones mayores al 2023. Los estudiantes entre 2018 y 2023, etc.
   * @param promotionGroup String. Grupo de promoción a buscar.
   * @returns Object. {promotionMax, promotionMin} Limites superiores e inferiores (incluyentes) en años.
   */
  async getPromotionRange({ promotionGroup }) {
    const { firstYearPromotion, lastYearPromotion } = await this.getFirstAndLastYearPromotion();
    let promotionMin = null;
    let promotionMax = null;

    const promotionGroups = Object.values(consts.promotionsGroups);
    if (!promotionGroups.includes(promotionGroup)) {
      throw new CustomError('El grupo de promociones no existe.', 404);
    } // No es un grupo de usuarios

    if (promotionGroup === consts.promotionsGroups.chick) {
      // si son pollitos
      promotionMin = firstYearPromotion + 1;
    } else if (promotionGroup === consts.promotionsGroups.student) {
      // si son estudiantes
      promotionMin = lastYearPromotion;
      promotionMax = firstYearPromotion;
    } else {
      // si son graduados
      promotionMax = lastYearPromotion - 1;
    }

    return { promotionMin, promotionMax };
  }
}

export {
  saveCurrentStudentPromotions,
  validateResponsible,
};
export default Promotion;

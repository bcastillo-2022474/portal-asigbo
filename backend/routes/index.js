import express from 'express';
import userRouter from '../apiServices/user/user.route.js';
import sessionRouter from '../apiServices/session/session.route.js';
import activityRouter from '../apiServices/activity/activity.router.js';
import asigboAreaRouter from '../apiServices/asigboArea/asigboArea.route.js';
import activityAssignmentRouter from '../apiServices/activityAssignment/activityAssignment.router.js';
import promotionRouter from '../apiServices/promotion/promotion.route.js';
import imageRouter from '../apiServices/image/image.router.js';
import consts from '../utils/consts.js';
import paymentRouter from '../apiServices/payment/payment.route.js';

const router = express.Router();

const { apiPath } = consts;

router.use(`${apiPath}/user`, userRouter);
router.use(`${apiPath}/session`, sessionRouter);
router.use(`${apiPath}/activity`, activityAssignmentRouter);
router.use(`${apiPath}/activity`, activityRouter);
router.use(`${apiPath}/area`, asigboAreaRouter);
router.use(`${apiPath}/promotion`, promotionRouter);
router.use(`${apiPath}/image`, imageRouter);
router.use(`${apiPath}/payment`, paymentRouter);

router.get('*', (req, res) => {
  res.sendFile(`${global.dirname}/public/index.html`);
});
export default router;

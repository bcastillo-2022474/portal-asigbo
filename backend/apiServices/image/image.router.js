import express from 'express';
import {
  getActivityImageController, getAreaImageController, getAssignmentImageController, getPaymentVoucherImageController, getUserImageController,
} from './image.controller.js';

const imageRouter = express.Router();

imageRouter.get('/user/:id', getUserImageController);
imageRouter.get('/area/:id', getAreaImageController);
imageRouter.get('/activity/:id', getActivityImageController);
imageRouter.get('/paymentVoucher/:id(*)', getPaymentVoucherImageController);
imageRouter.get('/assignment/:id', getAssignmentImageController);

export default imageRouter;

import express from 'express';

import {
  createActivityController,
  deleteActivityController,
  getActivitiesController,
  getActivityController,
  updateActivityController,
  enableActivityController,
  disableActivityController,
  getActivitiesWhereUserIsResponsibleController,
  getAvailableActivitiesToParticipateController,
} from './activity.controller.js';
import validateBody from '../../middlewares/validateBody.js';
import createActivitySchema from './validationSchemas/createActivitySchema.js';
import updateActivitySchema from './validationSchemas/updateActivitySchema.js';
import ensureRolesAuth from '../../middlewares/ensureRolesAuth.js';
import multerMiddleware from '../../middlewares/multerMiddleware.js';
import ensureAreaResponsibleAuth from '../../middlewares/ensureAreaResponsibleAuth.js';
import ensureActivityResponsibleAuth from '../../middlewares/ensureActivityResponsibleAuth.js';
import consts from '../../utils/consts.js';
import uploadBannerImage from '../../services/uploadFiles/uploadBannerImage.js';

const activityRouter = express.Router();

activityRouter.get(
  '/',
  ensureActivityResponsibleAuth,
  getActivitiesController,
);
activityRouter.get('/available', ensureRolesAuth(null), getAvailableActivitiesToParticipateController);

activityRouter.get('/:idActivity', ensureRolesAuth(null), getActivityController);

activityRouter.post(
  '/',
  ensureAreaResponsibleAuth,
  multerMiddleware(uploadBannerImage.single('banner'), consts.uploadFileSizeLimit.banner),
  validateBody(createActivitySchema),
  createActivityController,
);
activityRouter.patch(
  '/:idActivity',
  ensureAreaResponsibleAuth,
  multerMiddleware(uploadBannerImage.single('banner'), consts.uploadFileSizeLimit.banner),
  validateBody(updateActivitySchema),
  updateActivityController,
);

activityRouter.delete(
  '/:idActivity',
  ensureAreaResponsibleAuth,
  deleteActivityController,
);

activityRouter.patch(
  '/:idActivity/enable',
  ensureAreaResponsibleAuth,
  enableActivityController,
);
activityRouter.patch(
  '/:idActivity/disable',
  ensureAreaResponsibleAuth,
  disableActivityController,
);

activityRouter.get(
  '/responsible/:idUser',
  ensureRolesAuth(null),
  getActivitiesWhereUserIsResponsibleController,
);

export default activityRouter;

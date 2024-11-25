import express from 'express';

import {
  assignUserToActivityController,
  getActivitiesAssigmentsByActivityController,
  getActivitiesAssigmentsController,
  getActivityAssigmentController,
  getLoggedActivitiesController,
  getUserNotCompletedAssignmentsController,
  unassignUserFromActivityController,
  updateActivityAssignmentController,
} from './activityAssignment.controller.js';
import validateBody from '../../middlewares/validateBody.js';
import validateParams from '../../middlewares/validateParams.js';
import requiredIdUserSchema, {
  optionalIdUserSchema,
} from './validationSchemas/requiredIdUserSchema.js';
import requiredIdActivitySchema from './validationSchemas/requiredIdActivitySchema.js';
import updateAssignmentSchema from './validationSchemas/updateAssignmentSchema.js';
import validateQuery from '../../middlewares/validateQuery.js';
import ensureActivityResponsibleAuth from '../../middlewares/ensureActivityResponsibleAuth.js';
import ensureRolesAuth from '../../middlewares/ensureRolesAuth.js';
import uploadImageOrDocument from '../../services/uploadFiles/uploadImageOrDocument.js';
import multerMiddleware from '../../middlewares/multerMiddleware.js';
import consts from '../../utils/consts.js';

const activityAssignmentRouter = express.Router();

activityAssignmentRouter.post(
  '/:idActivity/assignment',
  ensureRolesAuth(null),
  validateParams(requiredIdActivitySchema),
  assignUserToActivityController,
);

activityAssignmentRouter.post(
  '/:idActivity/assignment/:idUser',
  ensureActivityResponsibleAuth,
  validateParams(requiredIdUserSchema, requiredIdActivitySchema),
  assignUserToActivityController,
);

activityAssignmentRouter.get(
  '/assignment',
  ensureRolesAuth(null),
  validateQuery(optionalIdUserSchema),
  getActivitiesAssigmentsController,
);
activityAssignmentRouter.get(
  '/:idActivity/assignment',
  ensureRolesAuth(null),
  validateParams(requiredIdActivitySchema),
  getActivitiesAssigmentsByActivityController,
);
activityAssignmentRouter.get(
  '/:idActivity/assignment/:idUser',
  ensureActivityResponsibleAuth,
  validateParams(requiredIdActivitySchema, requiredIdUserSchema),
  getActivityAssigmentController,
);
activityAssignmentRouter.get(
  '/assignment/logged',
  ensureRolesAuth(null),
  getLoggedActivitiesController,
);
activityAssignmentRouter.get(
  '/assignment/notCompleted',
  ensureRolesAuth(null),
  getUserNotCompletedAssignmentsController,
);

activityAssignmentRouter.patch(
  '/:idActivity/assignment/:idUser',
  ensureActivityResponsibleAuth,
  multerMiddleware(uploadImageOrDocument.array('files', 5), consts.uploadFileSizeLimit.files),
  validateBody(updateAssignmentSchema),
  updateActivityAssignmentController,
);
activityAssignmentRouter.delete(
  '/:idActivity/assignment/:idUser',
  ensureActivityResponsibleAuth,
  validateParams(requiredIdUserSchema, requiredIdActivitySchema),
  unassignUserFromActivityController,
);

export default activityAssignmentRouter;

import express from 'express';
import {
  assignAdminRoleController,
  createUserController,
  finishRegistrationController,
  getUsersListController,
  getAdminUsersController,
  getLoggedUserController,
  getUserController,
  removeAdminRoleController,
  validateRegisterTokenController,
  disableUserController,
  enableUserController,
  deleteUserController,
  updateUserController,
  renewRegisterToken,
  uploadUsersController,
  recoverPasswordController,
  updateUserPasswordController,
  validateRecoverTokenController,
  assignPromotionResponsibleRoleController,
  removePromotionResponsibleRoleController,
  getPromotionResponsibleUsersController,
  renewManyRegisterTokensController,
  getUserReportController,
  getUserReportFileController,
} from './user.controller.js';
import validateBody from '../../middlewares/validateBody.js';
import createUserSchema from './validationSchemas/createUserSchema.js';
import renewRegisterTokenSchema from './validationSchemas/renewRegisterTokenSchema.js';
import recoverPasswordSchema from './validationSchemas/recoverPasswordSchema.js';
import ensureAdminAuth from '../../middlewares/ensureAdminAuth.js';
import ensureRefreshTokenAuth from '../../middlewares/ensureRefreshTokenAuth.js';
import ensureRegisterAuth from '../../middlewares/ensureRegisterAuth.js';
import ensureRecoverAuth from '../../middlewares/ensureRecoverAuth.js';
import multerMiddleware from '../../middlewares/multerMiddleware.js';
import uploadImage from '../../services/uploadFiles/uploadImage.js';
import finishRegistrationSchema from './validationSchemas/updatePasswordSchema.js';
import uploadUsersSchema from './validationSchemas/uploadUsersSchema.js';
import validateParams from '../../middlewares/validateParams.js';
import {
  updateUserBodySchema,
  updateUserParamsSchema,
} from './validationSchemas/updateUserSchema.js';
import ensureRolesAuth from '../../middlewares/ensureRolesAuth.js';
import consts from '../../utils/consts.js';

const userRouter = express.Router();

userRouter.post('/', ensureAdminAuth, validateBody(createUserSchema), createUserController);
userRouter.post(
  '/finishRegistration',
  ensureRegisterAuth,
  multerMiddleware(uploadImage.single('photo')),
  validateBody(finishRegistrationSchema),
  finishRegistrationController,
);
userRouter.post(
  '/updatePassword',
  ensureRecoverAuth,
  validateBody(finishRegistrationSchema),
  updateUserPasswordController,
);
userRouter.get(
  '/',
  ensureRolesAuth(
    [
      consts.roles.admin,
      consts.roles.asigboAreaResponsible,
      consts.roles.activityResponsible,
      consts.roles.promotionResponsible,
    ],
    'El usuario no cuenta con privilegios de administrador, encargado de eje de asigbo, encargado de actividad o encargado de promoción.',
  ),
  getUsersListController,
);
userRouter.get('/admin', ensureAdminAuth, getAdminUsersController);
userRouter.get('/promotionResponsible', ensureAdminAuth, getPromotionResponsibleUsersController);
userRouter.post(
  '/renewRegisterToken',
  ensureAdminAuth,
  validateBody(renewRegisterTokenSchema),
  renewRegisterToken,
);
userRouter.get('/logged', ensureRefreshTokenAuth, getLoggedUserController);
userRouter.get('/validateRegisterToken', ensureRegisterAuth, validateRegisterTokenController);
userRouter.get('/validateRecoverToken', ensureRecoverAuth, validateRecoverTokenController);
userRouter.get('/report', ensureAdminAuth, getUserReportController);
userRouter.get('/report/file', ensureAdminAuth, getUserReportFileController);
userRouter.get('/:idUser', ensureRefreshTokenAuth, getUserController);
userRouter.patch('/:idUser/role/admin', ensureAdminAuth, assignAdminRoleController);
userRouter.delete('/:idUser/role/admin', ensureAdminAuth, removeAdminRoleController);
userRouter.patch('/:idUser/role/promotionResponsible', ensureAdminAuth, assignPromotionResponsibleRoleController);
userRouter.delete('/:idUser/role/promotionResponsible', ensureAdminAuth, removePromotionResponsibleRoleController);
userRouter.patch('/:idUser/disable', ensureAdminAuth, disableUserController);
userRouter.patch('/:idUser/enable', ensureAdminAuth, enableUserController);
userRouter.delete('/:idUser', ensureAdminAuth, deleteUserController);
userRouter.patch(
  '/:idUser',
  ensureRefreshTokenAuth,
  multerMiddleware(uploadImage.single('photo')),
  validateParams(updateUserParamsSchema),
  validateBody(updateUserBodySchema),
  updateUserController,
);
userRouter.post(
  '/uploadUsers',
  ensureAdminAuth,
  validateBody(uploadUsersSchema),
  uploadUsersController,
);
userRouter.post('/recoverPassword', validateBody(recoverPasswordSchema), recoverPasswordController);
userRouter.post('/renewManyRegisterTokens', ensureAdminAuth, renewManyRegisterTokensController);
export default userRouter;

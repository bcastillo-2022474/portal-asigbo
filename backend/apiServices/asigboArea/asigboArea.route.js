import express from 'express';
import {
  createAsigboAreaController,
  deleteAsigboAreaController,
  disableAsigboAreaController,
  enableAsigboAreaController,
  getAreasController,
  getAsigboAreaController,
  updateAsigboAreaController,
} from './asigboArea.controller.js';
import validateBody from '../../middlewares/validateBody.js';
import createAsigboAreaSchema from './validationSchemas/createAsigboAreaSchema.js';
import ensureAdminAuth from '../../middlewares/ensureAdminAuth.js';
import multerMiddleware from '../../middlewares/multerMiddleware.js';
import uploadImage from '../../services/uploadFiles/uploadImage.js';
import ensureAreaResponsibleAuth from '../../middlewares/ensureAreaResponsibleAuth.js';

const asigboAreaRouter = express.Router();

asigboAreaRouter.post(
  '/',
  ensureAdminAuth,
  multerMiddleware(uploadImage.single('icon')),
  validateBody(createAsigboAreaSchema),
  createAsigboAreaController,
);
asigboAreaRouter.patch(
  '/:idArea',
  ensureAdminAuth,
  multerMiddleware(uploadImage.single('icon')),
  validateBody(createAsigboAreaSchema),
  updateAsigboAreaController,
);
asigboAreaRouter.patch(
  '/:idArea/disable',
  ensureAdminAuth,
  disableAsigboAreaController,
);
asigboAreaRouter.patch(
  '/:idArea/enable',
  ensureAdminAuth,
  enableAsigboAreaController,
);

asigboAreaRouter.delete('/:idArea', ensureAdminAuth, deleteAsigboAreaController);

asigboAreaRouter.get('/', ensureAreaResponsibleAuth, getAreasController);
asigboAreaRouter.get('/:idArea', ensureAreaResponsibleAuth, getAsigboAreaController);

export default asigboAreaRouter;

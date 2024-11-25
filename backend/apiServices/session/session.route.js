import express from 'express';
import validateBody from '../../middlewares/validateBody.js';
import loginSchema from './validationSchemas/loginSchema.js';
import { loginController, logoutController, refreshAccessTokenController } from './session.controller.js';
import ensureRefreshTokenAuth from '../../middlewares/ensureRefreshTokenAuth.js';

const sessionRouter = express.Router();

sessionRouter.post('/login', validateBody(loginSchema), loginController);
sessionRouter.get('/accessToken', ensureRefreshTokenAuth, refreshAccessTokenController);
sessionRouter.post('/logout', ensureRefreshTokenAuth, logoutController);

export default sessionRouter;

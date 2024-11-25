import consts from '../utils/consts.js';
import ensureRolesAuth from './ensureRolesAuth.js';

const ensureAreaResponsibleAuth = ensureRolesAuth(
  [consts.roles.admin, consts.roles.asigboAreaResponsible],
  'No se cuenta con los privilegios necesarios de administrador o encargado de área.',
);

export default ensureAreaResponsibleAuth;

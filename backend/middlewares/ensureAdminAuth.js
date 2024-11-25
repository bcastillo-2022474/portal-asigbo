import consts from '../utils/consts.js';
import ensureRolesAuth from './ensureRolesAuth.js';

const ensureAdminAuth = ensureRolesAuth(
  [consts.roles.admin],
  'No se cuenta con los privilegios necesarios de administrador.',
);
export default ensureAdminAuth;

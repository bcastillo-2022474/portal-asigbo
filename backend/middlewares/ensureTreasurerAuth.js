import consts from '../utils/consts.js';
import ensureRolesAuth from './ensureRolesAuth.js';

const ensureTreasurerAuth = ensureRolesAuth(
  [consts.roles.treasurer],
  'No se cuenta con los privilegios necesarios de tesorero.',
);
export default ensureTreasurerAuth;

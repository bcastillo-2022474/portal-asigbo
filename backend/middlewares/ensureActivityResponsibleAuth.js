import consts from '../utils/consts.js';
import ensureRolesAuth from './ensureRolesAuth.js';

const ensureActivityResponsibleAuth = ensureRolesAuth(
  [consts.roles.admin, consts.roles.asigboAreaResponsible, consts.roles.activityResponsible],
  'No se cuenta con los privilegios necesarios de administrador, encargado de área o encargado de actividad.',
);

export default ensureActivityResponsibleAuth;

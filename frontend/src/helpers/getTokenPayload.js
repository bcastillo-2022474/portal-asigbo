import { Buffer } from 'buffer';
/**
 * @function getTokenPayload: Función que devuleve en formato JSON el payload de un token
 *
 * @param {string} token: Token de la sesión
 *
 * @throws {Token Invalido} De no estar en un formato adecuado o no ser un string.
 *
 * @property {Object} payload: Carga del token
 * -- @property {string} id: ID Hashed del becado en la base de datos.
 * -- @property {number} code: Código del becado.
 * -- @property {string} name: Nombre(s) del becado.
 * -- @property {string} lastname: Apellido(s) del becado.
 * -- @property {number} promotion: Año de promoción del becado.
 * -- @property {string} career: Carrera en la que el becado está inscrito.
 * -- @property {string} sex: Sexo del becado, esta se encuentra en "M" para masculino y "F" para
 * -- femenino respectivamente.
 * -- @property {string} type: Tipo de acceso que posee el usuario al que pertenece el token dado.
 * -- @property {string[]} role: Arreglo que contiene los roles y eventualmente "permisos" que posee
 * -- el usuario al que pertenece el token dado.
 *
 * @returns De ser correcto todo, devolverá un JSON con el payload del token.
 */

export default (token) => {
  if (typeof token !== 'string') throw new Error('Token Invalido.');

  const encodedPayload = token.split('.')[1];

  if (!encodedPayload) throw new Error('Token Invalido.');

  const payload = JSON.parse(Buffer.from(encodedPayload, 'base64').toString('utf-8'));

  return payload;
};

/*----------------------------------------------------------------------------------------------*/

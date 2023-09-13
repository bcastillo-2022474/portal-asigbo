/*----------------------------------------------------------------------------------------------*/

/**
 * @function aToUTF8: Función que decodifica un ASCII a UTF-8.
 *
 * @param {string} encoded: Obtiene la sección del token que contiene el payload
 * es decir, el substring luego del primer punto y antes del segundo, se espera que
 * esté codificado en ASCII.
 *
 * @returns Un String que contiene la notación proveniente del payload del token, se espera
 * que sea un formato admitible por JSON. **Necesita hacerse un parse a JSON luego de ejecutar
 * la función**
 */

const aToUTF8 = (encoded) => {
  const decodedToB = window.atob(encoded);
  const unicodeDecoder = new TextDecoder('utf-8');

  const uArray = new Uint8Array(decodedToB.length);
  for (let i = 0; i < decodedToB.length; i += 1) {
    uArray[i] = decodedToB.charCodeAt(i);
  }

  return unicodeDecoder.decode(uArray);
};

/*----------------------------------------------------------------------------------------------*/

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

  const payload = JSON.parse(aToUTF8(encodedPayload));

  return payload;
};

/*----------------------------------------------------------------------------------------------*/

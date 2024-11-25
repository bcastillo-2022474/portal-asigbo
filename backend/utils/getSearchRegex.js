/**
 * Convierte un string a una regex que permite ignorar tildes y mayúsculas, así como permite
 * que las palabras puedan estar separadas por cualquier caracter en medio.
 */
const getSearchRegex = (string = '') => string
  .replace(/[aáàäâAÁÀÄÂ]/gi, '[aáàäâAÁÀÄÂ]')
  .replace(/[eéëèEÉËÈ]/gi, '[eéëèEÉËÈ]')
  .replace(/[iíïìIÍÏÌ]/gi, '[iíïìIÍÏÌ]')
  .replace(/[oóöòOÓÖÒ]/gi, '[oóöòOÓÖÒ]')
  .replace(/[uüúùUÜÚÙ]/gi, '[uüúùUÜÚÙ]')
  .replace(/\s/g, '.*');
export default getSearchRegex;

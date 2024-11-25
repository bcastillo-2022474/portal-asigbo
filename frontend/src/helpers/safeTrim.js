/**
 * Función que recorta los espacios en blanco de un string (si lo es) y retorna el resultado.
 * @param {string} str - El string a recortar.
 * @returns {string|null} - El string recortado.
 */
const safeTrim = (str) => (typeof str?.trim === 'function' ? str?.trim() : str);
export default safeTrim;

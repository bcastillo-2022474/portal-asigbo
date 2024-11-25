/**
 * Función para verificar que una o varios valores no sean undefined o null.
 * @param val valores a verificar.
 * @returns bool
 */
const exists = (...values) => values?.some((val) => val === undefined || val === null) === false;

/**
 * Función para verificar que alguno de los valores no sean undefined o null.
 * @param val valores a verificar.
 * @returns bool
 */
const someExists = (...values) => values?.some((val) => val !== undefined && val !== null);
export default exists;
export { someExists };

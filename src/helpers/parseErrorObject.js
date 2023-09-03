/* eslint-disable prefer-destructuring */
/**
 *
 * @param errObj objeto de error arrojado por yup
 * @returns retorna los errores en formato {field: error}
 */
const parseErrorObject = (errObj) => {
  const errorsObjParsed = {};
  errObj.inner?.forEach((error) => {
    errorsObjParsed[error.path] = error.errors[0];
  });
  return errorsObjParsed;
};

export default parseErrorObject;

import consts from '../utils/consts.js';

export default (multerInstance, fileSizeLimit = consts.uploadFileSizeLimit.default) => (req, res, next) => {
  multerInstance(req, res, (err) => {
    if (!err) next();
    else {
      let error = err?.message ?? 'Ocurrió un error al subir imagen.';
      let status = err?.status ?? 500;

      if (err?.code === 'LIMIT_FILE_SIZE') {
        error = `El tamaño del archivo es demasiado grande. El tamaño máximo es de ${fileSizeLimit / 1000000} MB.`;
        status = 413;
      }

      res.statusMessage = error;
      res.status(status).send({ err: error, status });
    }
  });
};

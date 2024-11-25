import config from 'config';

const verboseConfig = config.get('verbose');

/**
 * Función que imprime un console.log dependiendo de la configuración del ambiente.
 * El nivel de verbose 1 es poco detallado y 3 muy detallado.
 */
const writeLog = async (verbose, ...content) => {
  // eslint-disable-next-line no-console
  if (verboseConfig >= verbose) console.log(...content);
};

export default writeLog;

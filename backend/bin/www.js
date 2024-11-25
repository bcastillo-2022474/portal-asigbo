import config from 'config';
import app from '../app.js';

const port = config.get('port');
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Servidor corriendo en puerto ${port}.`);
});

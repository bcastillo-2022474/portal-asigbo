/* eslint-disable no-console */
import express from 'express';
import { exec } from 'child_process';
import crypto from 'crypto';
import config from 'config';

const app = express();

app.use(express.raw({ type: 'application/json' }));

const secret = config.get('gitWebhookSecret');

// Función para verificar la firma de GitHub
function verifySignature(req) {
  const signature = req.headers['x-hub-signature-256'];
  const hmac = crypto.createHmac('sha256', secret);
  const bodyBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body);
  const digest = `sha256=${hmac.update(bodyBuffer).digest('hex')}`;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

app.post('/', (req, res) => {
  if (!verifySignature(req)) {
    console.error('Firma para reiniciar servidor no válida');
    return res.status(401).send('Firma no válida');
  }

  const payload = JSON.parse(req.body);

  // Solo aceptamos push a la rama master
  if (payload.ref === 'refs/heads/master') {
    // Reiniciar el servidor
    exec('git fetch origin && git reset --hard origin/master && pm2 stop asigboApp && npm run production', { cwd: './' }, (err) => {
      if (err) {
        console.error(`Error al ejecutar el script: ${err}`);
        return res.status(500).send('Error');
      }
      console.log('Servidor reiniciado automáticamente...');
      res.status(200).send('OK');
      return null;
    });
  } else {
    res.status(400).send('No se hizo push a la rama master');
  }
  return null;
});

app.listen(5000, () => {
  console.log('Servidor de Webhook escuchando en el puerto 5000');
});

import config from 'config';
import Email from './Email.js';

const host = config.get('host');

export default class RecoverPasswordEmail extends Email {
  sendEmail({ addresseeEmail, name, recoverToken }) {
    const recoverLink = `${host}/actualizarContrasena?access=${recoverToken}`;

    const message = `
    
    Has recibido este correo como respuesta a tu solicitod de restablecimiento de contraseña. Si no has
    sido tú, por favor ignora este mensaje y ponte en contacto con tus encargados de promoción.
    <br>
    <br>
    Para continuar con el proceso de restablecimiento de contraseña, haz clic en el enlace adjunto al
    final de este correo, o cópialo y pégalo en tu navegador.
    <br>
    <br>
    Si tienes alguna duda o el problema persiste, contacta con tus encargados de promoción.

    <br>
    <br>

    Enlace de recuperación: <a href='${recoverLink}'> ${recoverLink} </a>
    
    `;

    return super.sendEmail({
      addresseeEmail,
      subject: 'Recuperación de contraseña - Portal ASIGBO.',
      name,
      message,
    });
  }
}

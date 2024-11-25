import config from 'config';
import Email from './Email.js';

const host = config.get('host');

export default class NewUserEmail extends Email {
  sendEmail({ addresseeEmail, name, registerToken }) {
    const registerLink = `${host}/registro?access=${registerToken}`;

    const message = `
    
    Es un gusto saludarte y darte de nuevo la bienvenida a la familia de la Fundación y también a ASIGBO.
    Esperamos que esta sea una experiencia grata y emocionante para ti.
    <br>
    <br>
    Te comentamos que tu cuenta del nuevo portal de Asigbo ha sido creada exitosamente. A continuación,
    adjuntamos un enlace en el que podrás completar el proceso de registro y así acceder a las diferentes
    funcionalidades que te ofrece esta nueva herramienta.

    <br>
    <br>

    Enlace de acceso: <a href='${registerLink}'> ${registerLink} </a>
    
    `;

    return super.sendEmail({
      addresseeEmail,
      subject: 'Tu cuenta del portal de Asigbo ha sido creada.',
      name,
      message,
    });
  }
}

import nodemailer from 'nodemailer';
import moment from 'moment';
import 'moment/locale/es.js';
import config from 'config';
import aws from '@aws-sdk/client-ses';

const accessKeyId = config.get('awsSesAccess');
const secretAccessKey = config.get('awsSesSecret');
const host = config.get('smtpHost');
const port = config.get('smtpPort');
const sendingRate = config.get('emailSendingRate');

export default class Email {
  constructor() {
    const ses = new aws.SES({
      region: 'us-west-1',
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this._transporter = nodemailer.createTransport({
      SES: { ses, aws },
      host,
      port,
      sendingRate,
    });

    moment.locale('es');
  }

  static getMessageBody({ subject, name, message }) {
    return `
        <main>
            <div style='background:#0c4271; color:white; font-family:helvetica; font-size:30px;  width:100%;  text-align: center; padding: 15px 5px 15px 5px; box-sizing: border-box;'>
            Portal de Asigbo
            </div>
            <div 
              style='width:100%;
              border: 1px solid #f0f0f0;
              border-bottom: 1px solid #c0c0c0;
              border-bottom-left-radius: 3px;
              border-bottom-right-radius: 3px;
              background: rgb(250,250,250);
              padding: 25px 25px 35px 25px;
              font-family: helvetica;
              box-sizing: border-box;'
            >

                <center>
                    <h2 style="text-decoration: underline;">${subject}</h2>
                    
                </center>

                <div style="text-align: justify; font-size:16px;">
                    Hola ${name},
                    <br>
                    <br>
                    ${message}
                    <br>
                    <br>
                    Gracias.
                
                </p>
                <span style="
                    float:right; 
                    font-size:12px; 
                    color:gray; 
                    ">Mensaje generado el ${moment().format('LLLL')}</span>
                    </br>
            </div>
        </main>
        `;
  }

  sendEmail({
    addresseeEmail, subject, name, message,
  }) {
    return new Promise((resolve, reject) => {
      const mailOptions = {
        from: 'soporte.asigbo@gmail.com',
        to: addresseeEmail,
        subject,
        html: Email.getMessageBody({ subject, name, message }),
      };

      this._transporter.sendMail(mailOptions, (error, info) => {
        // enviar respuesta a promesa
        if (error) reject(error);
        else resolve(info);
      });
    });
  }
}

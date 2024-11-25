import Agenda from 'agenda';
import config from 'config';
import AgendaSchema from '../../db/schemas/agenda.schema.js';
import { deleteExpiredSessionTokens } from '../../apiServices/session/session.model.js';
import { deleteExpiredAlterTokens } from '../../apiServices/user/user.model.js';

const uri = config.get('dbConnectionUri');

export default class AgendaProcedures {
  static agenda;

  static async initAsyncAgenda() {
    const agenda = new Agenda({
      db: { address: uri, collection: 'agendaprocedures' },
    });
    AgendaProcedures.agenda = agenda;

    // definir procesos
    agenda.define('deleteTokens', async () => {
      await deleteExpiredSessionTokens();
      await deleteExpiredAlterTokens();
    });

    return new Promise((resolve) => {
      agenda.on('ready', async () => {
        await agenda.start();
        resolve();
      });
    });
  }

  static async startProcedures() {
    if (!AgendaProcedures.agenda) return;

    await AgendaSchema.deleteMany({});

    // node cron
    // sec(op) min h day month dayWeek

    AgendaProcedures.agenda.every('0 50 23 */5 * *', 'deleteTokens'); // every 5 days
  }
}

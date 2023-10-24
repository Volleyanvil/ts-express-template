import { connect as connectMongoose } from 'mongoose';
import { Logger } from '@config/logger.config';

class Database {
  constructor () {}

  // TODO: Connection options / config
  static async connect( uri: string/*, options?: */ ) {
    connectMongoose(uri)
    .then( () => {
      Logger.log({level: 'info', message: `Connected to MongoDB using URI ${uri}`, label: 'SERVER'})
    })
    .catch( (error: Error) => {
      Logger.log({level: 'debug', message: `DB Error - ${error.message}`});
      process.exit(1);
    });
  }
}

export { Database as DB };
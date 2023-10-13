import { connect as connectMongoose } from 'mongoose';
import { logger } from '@config/logger.config';

class Database {
  constructor () {}

  // TODO: Connection options / config
  static async connect( uri: string/*, options?: */ ) {
    connectMongoose(uri)
    .then( () => {
      logger.log({level: 'info', message: `Connected to MongoDB using URI ${uri}`, label: 'SERVER'})
    })
    .catch( (error: Error) => {
      logger.log({level: 'debug', message: `DB Error - ${error.message}`});
      process.exit(1);
    });
  }
}

export { Database as DB };
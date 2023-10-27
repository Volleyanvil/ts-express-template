import http from 'http';
import { AddressInfo } from 'net';
import { ConnectOptions } from 'mongoose';
import { ENV, HOST, PORT, MONGODB_URI } from '@config/environment.config';
import { createServer } from '@config/express.config';
import { Logger } from '@config/logger.config'
import { DB } from '@config/database.config';

// Add module aliases programmatically
import * as moduleAlias from 'module-alias';
const sourcePath = ENV !== 'production' ? 'src' : __dirname;
moduleAlias.addAliases({
  '@server': sourcePath,
  '@config': `${sourcePath}/config`,
  '@routes': `${sourcePath}/routes`,
  '@controllers': `${sourcePath}/controllers`,
  '@middleware': `${sourcePath}/middlewares`,
  '@models': `${sourcePath}/models`,
  '@services': `${sourcePath}/services`,
});

// Disable auto indexing in production
const connOptions: ConnectOptions = {};
if (ENV === 'production') connOptions.autoIndex = false;

const startServer = async () => {

  DB.connect(MONGODB_URI, connOptions);
  const app = await createServer();
  const server = http.createServer(app).listen({ host: HOST, port: PORT }, () => {
    const addressInfo = server.address() as AddressInfo;
    Logger.log({ 
      level: 'info', 
      message:  `HTTP server ready at http://${addressInfo.address}:${addressInfo.port}`, 
      label:'SERVER' });
  });

  const signalTraps: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
  signalTraps.forEach((type) => {
    process.once(type, async () => {
      Logger.log({ level: 'info', message: `process.once ${type}`, label:'SERVER' });

      server.close(() => {
        Logger.log({level: 'debug', message: 'HTTP Server closed'});
      });
    });
  });
};

startServer();
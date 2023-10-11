import http from 'http';
import { ENV, HOST, PORT } from '@config/environment.config';
import { createServer } from '@config/express.config';
import { logger } from '@config/logger.config'
import { AddressInfo } from 'net';

// Add module aliases programmatically
import * as moduleAlias from 'module-alias';
const sourcePath = ENV !== 'production' ? 'src' : __dirname;
moduleAlias.addAliases({
  '@server': sourcePath,
  '@config': `${sourcePath}/config`,
  '@routes': `${sourcePath}/routes`,
  '@controllers': `${sourcePath}/controllers`,
  '@middleware': `${sourcePath}/middlewares`,
});

const startServer = async () => {
  const app = await createServer();
  const server = http.createServer(app).listen({ host: HOST, port: PORT }, () => {
    const addressInfo = server.address() as AddressInfo;
    logger.log({ 
      level: 'info', 
      message:  `HTTP server ready at http://${addressInfo.address}:${addressInfo.port}`, 
      label:'SERVER' });
  });

  const signalTraps: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
  signalTraps.forEach((type) => {
    process.once(type, async () => {
      logger.log({ level: 'info', message: `process.once ${type}`, label:'SERVER' });

      server.close(() => {
        logger.log({level: 'debug', message: 'HTTP Server closed'});
      });
    });
  });
};

startServer();
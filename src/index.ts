import * as moduleAlias from 'module-alias';
const sourcePath = process.env.NODE_ENV !== 'production' ? 'src' : __dirname;
moduleAlias.addAliases({
  '@server': sourcePath,
  '@config': `${sourcePath}/config`,
  '@domain': `${sourcePath}/domain`,
  '@controller': `${sourcePath}/controller`,
  '@middleware': `${sourcePath}/middleware`,
});
import 'dotenv/config';

import { createServer } from '@config/express';
import { logger } from '@config/logger.config'
import { AddressInfo } from 'net';
import http from 'http';

const host = process.env.HOST;
const port = process.env.PORT;

const startServer = async () => {
  const app = await createServer();
  const server = http.createServer(app).listen({ host, port }, () => {
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
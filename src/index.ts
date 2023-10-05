import * as moduleAlias from 'module-alias';
const sourcePath = process.env.NODE_ENV === 'development' ? 'src' : __dirname;
moduleAlias.addAliases({
  '@server': sourcePath,
  '@config': `${sourcePath}/config`,
  '@domain': `${sourcePath}/domain`,
  '@controller': `${sourcePath}/controller`,
  '@middleware': `${sourcePath}/middleware`,
});
if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}

import { createServer } from '@config/express';
import { AddressInfo } from 'net';
import http from 'http';

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || '8000';

const startServer =async () => {
  const app = await createServer();
  const server = http.createServer(app).listen({ host, port }, () => {
    const addressInfo = server.address() as AddressInfo;
    console.log(
      `Listening to HTTP server at http://${addressInfo.address}:${addressInfo.port}`
    );
  });

  const signalTraps: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
  signalTraps.forEach((type) => {
    process.once(type, async () => {
      console.log(`process.once ${type}`);

      server.close(() => {
        console.log('HTTP Server closed')
      });
    });
  });
};

startServer();
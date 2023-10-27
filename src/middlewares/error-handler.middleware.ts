import { Request, Response, NextFunction } from 'express';
import { HttpError } from 'http-errors';
import { Logger } from '@config/logger.config';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {

  if (err instanceof HttpError) {
    Logger.log({level: 'error', message: `${req.socket.remoteAddress} ${err.statusCode} ${req.method} ${req.url} - ${err.message} : ${err.stack?'\n stack: '+err.stack:''} ${req.body?'\n  body: '+JSON.stringify(req.body):''}`});
    res
    .status(err.statusCode)
    .json({ statusCode: err.statusCode, statusText: err.name, message: err.message });
  } else {
    Logger.log({level: 'error', message: `${req.socket.remoteAddress} 500 ${req.method} ${req.url} - ${err.message} : ${err.stack?'\n stack: '+err.stack:''} ${req.body?'\n  body: '+JSON.stringify(req.body):''}`});
    res
    .status(500)
    .json({ statusCode: 500, statusText: 'Internal Server Error', message: 'An error has occurred while processing your request.' });
  }
}
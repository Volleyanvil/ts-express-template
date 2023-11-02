import { Request, Response, NextFunction } from 'express';
import { HttpError } from 'http-errors';
import { Error as MongooseError } from 'mongoose';
import { Logger } from '@config/logger.config';


export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  req.body.password = undefined;
  if (err instanceof HttpError) {
    Logger.log({level: 'error', message: `${req.socket.remoteAddress} ${err.statusCode} ${req.method} ${req.url} - ${err.message} : ${err.stack?'\n stack: '+err.stack:''} ${req.body?'\n  body: '+JSON.stringify(req.body):''}`});
    res
    .status(err.statusCode)
    .json({ statusCode: err.statusCode, statusText: err.name, message: err.message });
  } else if (err instanceof MongooseError.ValidationError) {
    const messages = {};
    Object.keys(err.errors).forEach((key) => {
      messages[key] = err.errors[key].message;
    });
    Logger.log({level: 'error', message: `${req.socket.remoteAddress} 400 ${req.method} ${req.url} - ${err.message} : ${err.stack?'\n stack: '+err.stack:''} ${err.errors?'\n errors: '+JSON.stringify(messages):''} ${req.body?'\n  body: '+JSON.stringify(req.body):''}`});
    res
    .status(400)
    .json({ statusCode: 400, statusText: 'Bad request', message: messages });
  } else {
    Logger.log({level: 'error', message: `${req.socket.remoteAddress} 500 ${req.method} ${req.url} - ${err.message} : ${err.stack?'\n stack: '+err.stack:''} ${req.body?'\n  body: '+JSON.stringify(req.body):''}`});
    res
    .status(500)
    .json({ statusCode: 500, statusText: 'Internal Server Error', message: 'An error has occurred while processing your request.' });
  }
}
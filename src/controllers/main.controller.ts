import { Request, Response } from 'express';

export class MainController {
  constructor() {}
  async getMainPage (_req: Request, res: Response) {
    res.status(200).send('Main route home page.');
  }
  async getHealth(_req: Request, res: Response) {
    res.status(200).send('UP');
  }
}

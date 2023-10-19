import { Request, Response } from 'express';
import { User } from '@models/user.schema';

// TODO: Request specific interfaces/dtos for ease of use & validation
//
// TODO: Request content validation (middleware?) for create, update methods

export class UserController {

  constructor() {}

  async getUsers (_req: Request, res: Response) {
    const users = await User.find().exec();
    res.json(users);
  }

  async createUser(req: Request, res: Response) {
    const newUser = new User(req.body);
    const saved = await newUser.save();
    res.status(201).json(saved);
  }

  // TODO: Requires authentication. Get session user data.
  async getSessionUser(_req: Request, res: Response) {
    res.send('Not yet implemented');
  }

  async getUser(req: Request, res: Response) {
    const user = await User.findById(req.params.userId).exec();
    if (!user) res.status(404).send('User could not be found.');
    res.json(user);
  }

  async updateUser(req: Request, res: Response) {
    const updated = await User.findOneAndUpdate({ _id: req.params.userId }, req.body ,{ new: true }).exec();
    if (!updated) res.status(404).send('User could not be found.');
    res.json(updated);
  }

  async deleteUser(req: Request, res: Response) {
    const deleted = await User.deleteOne({ _id: req.params.userId }).exec();
    if (!deleted.deletedCount) res.status(404).send('User could not be found.');
    res.send('User deleted succesfully');
  }
}

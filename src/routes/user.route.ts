import { Router } from 'express';
import { UserController } from '@controllers/user.controller';

// https://restful-api-node-typescript.books.dalenguyen.me/en/latest/using-controller-and-model.html

export class UserRouter {

  constructor() {

    this.router
      .route('/')
      .get(this.controller.getUsers)
      .post(this.controller.createUser);

    this.router
      .route('/profile')
      .get(this.controller.getSessionUser);

    this.router
      .route('/:userId')
      .get(this.controller.getUser)
      .patch(this.controller.updateUser)
      .delete(this.controller.deleteUser);
    
  }

  router = Router();

  private controller = new UserController();
}

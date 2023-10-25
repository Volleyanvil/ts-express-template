import { Router } from 'express';
import { AuthController } from '@controllers/auth.controller';


export class AuthRouter {

  constructor() {

    this.router.route('/register')
    .post(AuthController.register);

    this.router.route('/login')
      .post(AuthController.login);

    this.router.route('/logout')
      .post(AuthController.logout);
  
    this.router.route('/refresh-token')
      .post(AuthController.refresh);

    this.router.route('/reset-password')
      .get(AuthController.resetPassword);

    this.router.route('/verify-email')
      .patch(AuthController.verifyEmail);
  }

  router = Router();

}

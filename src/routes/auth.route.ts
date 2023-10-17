import { Router } from 'express';
import { AuthController } from '@controllers/auth.controller';


export class AuthRouter {

  constructor() {

    this.router.route('/register')
    .post(this.controller.register);

    this.router.route('/login')
      .post(this.controller.login);

    this.router.route('/logout')
      .post(this.controller.logout);
  
    this.router.route('/refresh-token')
      .post(this.controller.refreshToken);

    this.router.route('/reset-password')
      .get();

    this.router.route('/confirm-email')
      .patch(this.controller.verifyEmail);
  }

  router = Router();

  private controller = new AuthController();
}

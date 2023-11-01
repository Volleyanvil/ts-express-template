import passport from 'passport';
import { Router } from 'express';
import { AuthController } from '@controllers/auth.controller';


export class AuthRouter {

  constructor() {

    this.router.route('/register')
    .post(AuthController.register);

    this.router.route('/login')
    .post(AuthController.login);

    this.router.route('/logout')
    .post(passport.authenticate('jwt', {session: false}), AuthController.logout);
  
    this.router.route('/refresh-token')
    .post(AuthController.refresh);

    this.router.route('/active-logins')
    .post(passport.authenticate('jwt', {session: false}), AuthController.activeLogins);

    this.router.route('/revoke-logins')
    .post(passport.authenticate('jwt', {session: false}), AuthController.revoke);

    this.router.route('/revoke-all')
    .post(passport.authenticate('jwt', {session: false}), AuthController.revokeAll);

    this.router.route('/verify-email')
    .patch(AuthController.verifyEmail);

    this.router.route('/reset-password')
    .get(AuthController.resetPassword);

  }

  router = Router();

}

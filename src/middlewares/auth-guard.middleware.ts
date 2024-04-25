import passport from 'passport';

class AuthGuard {

  private static instance: AuthGuard;

  private constructor() {}

  static get(): AuthGuard {
    if (!AuthGuard.instance) {
      AuthGuard.instance = new AuthGuard();
    }
    return AuthGuard.instance;
  }

  authenticate = ( req, res, next, cb ) => passport.authenticate('jwt', {session: false}, cb(req, res, next) ) (req, res, next)

}

const instance = AuthGuard.get();

export { instance as AuthGuard };
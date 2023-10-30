import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { ACCESS_TOKEN_SECRET } from '@config/environment.config';
import { AuthService } from '@server/services/auth.service';


// Experimenting with singleton pattern approach based on https://github.com/konfer-be/typeplate

class Auth {

  // Static class instance
  private static instance: Auth;

  // Default options for JWT strategy
  private options = {
    jwt: {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: ACCESS_TOKEN_SECRET,
      passReqToCallback: true,
    },
  }

  private constructor() {}

  // Singleton instance getter
  static get(): Auth {
    if (!Auth.instance) {
      Auth.instance = new Auth();
    }
    return Auth.instance;
  }

  // Passport initialize wrapper
  init = (): any => {
    return passport.initialize();
  }

  // Plug auth strategies
  plug(): void {
    passport.use(new JwtStrategy(this.options.jwt, AuthService.jwt));
  }
}

const instance = Auth.get();

export { instance as Auth };
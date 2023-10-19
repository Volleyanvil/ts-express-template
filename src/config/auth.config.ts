import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { HydratedDocument } from 'mongoose';

import { IUser, User } from '@models/user.schema';


// TODO: Update environment.config
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

// Experimenting with singleton pattern approach based on https://github.com/konfer-be/typeplate

class Auth {

  // Static class instance
  private static instance: Auth;

  // Default options for JWT strategy
  private jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: ACCESS_TOKEN_SECRET,
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
    passport.use(new JwtStrategy(this.jwtOptions, async (payload: {sub: string}, next: (e?: Error, v?: HydratedDocument<IUser>|boolean) => void): Promise<void> => {
      try {
        const user = await User.findById(payload.sub);
        if (user) return next(null, user);
        return next(null, false);
      } catch (error) {
        return next(<Error>error, false);
      }
    }));
  }
}

const instance = Auth.get();

export { instance as Auth };
import { Response } from 'express';
import { HydratedDocument, Types as MongooseTypes } from 'mongoose';
import createHttpError from 'http-errors';

import { RefreshToken } from '@models/refresh-token.schema';
import { TokenFamily } from '@models/token-family.schema';
import { IUser, User } from '@models/user.schema';
import { AuthService } from '@services/auth.service';
import { IRequest } from '@server/interfaces/request.interface';


class AuthController {

  private static instance: AuthController;


  constructor() {}


  static get(): AuthController {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController();
    }
    return AuthController.instance;
  }


  // Creates and authenticates new user
  async register(req: IRequest, res: Response, next: (err?: Error) => void): Promise<void> {
    // Password validation here
    try {
      if (req.body.password && !AuthService.validatePassword(req.body.password)) return next (createHttpError(400, 'Password must be at least 12 characters long and include at leas one upper case letter, lower case letter, number and non-word character'));
      const newUser = await User.create(req.body);
      const accessToken = await AuthService.generateAccessToken(newUser._id);
      const refreshToken = await AuthService.generateRefreshToken(newUser._id);
      newUser.password = undefined;  // Exclude password field from document
      res.status(201)
      .cookie('refreshToken', refreshToken.token, {
        httpOnly: true, 
        expires: refreshToken.expires, 
        secure: true, 
        path: '/auth'
      })
      .json({ user: newUser, accessToken: accessToken });
    } catch (err) {
      return next(<any>err);
    }
  }


  // Authenticates user with credentials
  async login(req: IRequest, res: Response, next: (err?: Error) => void): Promise<void> {
    const {username, email, password } = req.body;

    if (!username && !email) return next(createHttpError(400, 'Please provide a valid username or email to log in'));
    if (!password) return next(createHttpError(400, 'Please provide a valid password to log in'));

    const user = await User.findOne({$or: [
      {username: username},
      {email: email}
    ]}).select('username firstName lastrName email isActive role password').exec();

    if (!user) {
      return next(createHttpError(400, 'Please check that the username or email is correct'));
    } else if (password && user.checkPassword(password) === false) {
      return next(createHttpError(400, 'Incorrect password'));
    }

    const accessToken = await AuthService.generateAccessToken(user._id);
    const refreshToken = await AuthService.generateRefreshToken(user._id);
    user.password = undefined;  // Exclude password field from document
    res.status(200)
    .cookie('refreshToken', refreshToken.token, {
      httpOnly: true, 
      expires: refreshToken.expires, 
      secure: true, 
      path: '/auth'
    })
    .json({ user: user, accessToken: accessToken });
  }


  // Revokes current refresh token and token family
  async logout(req: IRequest, res: Response, next: (err: Error) => void): Promise<void> {
    if (!req.cookies.refreshToken) return next(createHttpError(400, 'Nothing to revoke'));
    
    const refreshToken = await RefreshToken.findOne({token: req.cookies.refreshToken}).exec();
    if (!refreshToken) return next(createHttpError(400, 'Invalid refresh token'));

    const user = req.user as HydratedDocument<IUser>;
    if (refreshToken.user !== user._id) return next(createHttpError(403, 'Invalid refresh token'));

    await AuthService.revokeRefreshTokens(refreshToken.familyRoot);
    res.status(200).json({ message: 'Logged out successfully' });
  }


  // Generate new access token against a refresh token, rotate refresh token.
  async refresh(req: IRequest, res: Response, next: (err: Error) => void): Promise<void> {
    if (!req.cookies.refreshToken) return next(createHttpError(400, 'Missing refresh token'));

    const oldRefreshToken = await RefreshToken.findOne({token: req.cookies.refreshToken}).exec();
    if (!oldRefreshToken) return next(createHttpError(404, 'Refresh token not found'));

    const user = await User.findById(oldRefreshToken.user).lean();
    if (!user) return next(createHttpError(403, 'Invalid refresh token: User not found'));

    const { accessToken, refreshToken } = await AuthService.rotateToken(oldRefreshToken);

    res.status(200)
    .cookie('refreshToken', refreshToken.token, {
      httpOnly: true, 
      expires: refreshToken.expires, 
      secure: true, 
      path: '/auth'
    })
    .json({ accessToken: accessToken });
  }


  // Responds with a list of the requesting user's active logins (token families).
  async activeLogins(req: IRequest, res: Response): Promise<void> {
    const user = req.user as HydratedDocument<IUser>;
    const logins = await TokenFamily.find({ user: user._id }).populate('current', 'expires').exec();
    res.status(200).json({ activeLogins: logins });
  }


  // NOTE: Admins should have a separate tool/interface to revoke tokens for a specified user

  // Accepts an array of token family ids and revokes related refresh tokens. 
  async revoke(req: IRequest, res: Response, next: (err: Error) => void): Promise<void> {
    const user = req.user as HydratedDocument<IUser>;
    const familyIds = req.body.list as MongooseTypes.ObjectId[] || undefined;
    if (typeof(familyIds) === 'undefined') return next(createHttpError(400, 'Request body is empty'));

    const families = await TokenFamily.find({ _id: {$in: familyIds} });
    if (!families) return next(createHttpError(404, 'Logins not found'));
    
    families.forEach(family => {
      if (family.user !== user._id) return next(createHttpError(403, 'You do not have permission to revoke provided logins'));
    })

    const deleted = AuthService.revokeRefreshTokens(familyIds);
    
    res.status(200).json({ message: 'Logins revoked successfully.', deletedCount: deleted });
  }


  // Revokes all token families for current user
  async revokeAll(req: IRequest, res: Response): Promise<void> {
    const user = req.user as HydratedDocument<IUser>;
    await AuthService.revokeAll(user._id);
    res.status(200).json({ message: 'All logins terminated succesfully' })
  }


  // TODO
  // Verify user's email address
  async verifyEmail(_req: IRequest, res: Response): Promise<void> {
    // Using a mailer event:
    // > Send user a confirmation link containing a short-lived, signed token
    // > Decode and and verify token and user eligibility for email confirmation
    // > Update user email confirmation status
    res.status(500).send('Email verification has not yet been implemented.');
  }


  // TODO
  // Reset user's password
  async resetPassword(_req: IRequest, res: Response): Promise<void> {
    // Option A:
    // Send user a reset link containing a short-lived, scoped token
    // When the token is succesfully used, update the user's password and revoke all logins
    // Option B:
    // Set a random temporary password, send it to the user, revoke sessions
    // Extra(B): Add a recovery flag to the user model which is set when requesting a password reset/recovery
    //           Users are directed to change their temp password to reset the flag.
    //           While the flag is set, prevent access to protected resources.
    // Verified email only
    res.status(500).send('Password resetting has not yet been implemented.');
  }  

}

const instance = AuthController.get();

export { instance as AuthController }
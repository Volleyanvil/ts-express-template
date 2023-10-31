import { Request, Response } from 'express';
import { HydratedDocument, Error as MongooseError } from 'mongoose';
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
  async register(req: Request, res: Response): Promise<void> {
    try {
      const newUser = await User.create(req.body);
      // Created user has to be queried again to deselect password field. delete does not work.
      const user = await User.findById(newUser._id);
      const accessToken = await AuthService.generateAccessToken(user._id);
      const refreshToken = await AuthService.generateRefreshToken(user._id);
      res.status(201)
      .cookie('refreshToken', refreshToken.token, {
        httpOnly: true, 
        expires: refreshToken.expires, 
        secure: true, 
        path: '/auth'
      })
      .json({ user: user, accessToken: accessToken });
    } catch (err) {
      // TODO: Move error handling to dedicated middleware
      // TODO: Handle validation errors by type and limit message contents
      if (err instanceof MongooseError.ValidationError) {
        // https://mongoosejs.com/docs/api/error.html#Error.ValidationError
        const error = err as MongooseError.ValidationError;
        const errors = {};
        Object.keys(error.errors).forEach((key) => {
          errors[key] = error.errors[key].message;
        })
        console.log(err.name, ' - ', err.errors);
        res.status(400).json(errors);
      } else if (err instanceof Error) {
        const error = err as Error;
        console.log(error.name, ' - ', error.message);
        res.status(500).json({message: 'Internal server error'});
      } else {
        console.log('Unkown error: ', err);
      }
    }
  }

  // Authenticates user with credentials
  async login(req: Request, res: Response, next: (err?: Error) => void): Promise<void> {
    const {username, email, password } = req.body;

    if (!username && !email) return next(createHttpError(400, 'Please provide a valid username or email to log in'));
    if (!password) return next(createHttpError(400, 'Please provide a valid password to log in'));

    const user = await User.findOne({$or: [
      {username: username},
      {email: email}
    ]}).select('password').exec();

    if (!user) {
      return next(createHttpError(400, 'Please check that the username or email is correct'));
    } else if (password && user.checkPassword(password) === false) {
      return next(createHttpError(400, 'Incorrect password'));
    }

    const accessToken = await AuthService.generateAccessToken(user._id);
    const refreshToken = await AuthService.generateRefreshToken(user._id);
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
    res.status(200).json({message: 'Logged out successfully'});
  }

  // Generate new access token against a refresh token, rotate refresh token.
  async refresh(req: IRequest, res: Response, next: (err: Error) => void): Promise<void> {
    if (!req.cookies.refreshToken) return next(createHttpError(400, 'Missing refresh token'));

    const oldRefreshToken = await RefreshToken.findOne({token: req.cookies.refreshToken}).exec();
    if (!oldRefreshToken) return next(createHttpError(404, 'Refresh token not found'));

    const user = req.user as HydratedDocument<IUser>;
    if (oldRefreshToken.user !== user._id) return next(createHttpError(403, 'Invalid refresh token'));

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
    const logins = TokenFamily.find({ user:  req.user.id }).populate('current', 'expires').exec();
    res.status(200).json(logins);
  }

  // NOTE: Admins should also have the ability to revoke users' tokens. This should be implemented separately

  // TODO
  // Revokes one or more refresh token families specified in request body.
  async revoke(_req: Request, res: Response): Promise<void> {
    // NOTE: Users should only be able to revoke their own tokens
    // NOTE: One option for implementation is to accept an array of ObjectId strings corresponding to family root tokens.
    //       The _id field is not secret, since it is never used for token generation, and ownership should be enforced
    //       Using non-root token IDs could also be implemented, but that would add complexity.
    //       This could be done by getting all requested tokens from DB, adding their roots to an array,
    //       removing duplicates, and revoking each (or all at once).
    // NOTE: Implementing token families as DB docs would make handling token families easier, but adds more queries

    // Extract token IDs from body and get corresponding tokens from db. _id: { $in: [string|mongoose.Types.ObjectId]}
    // Revoke each found token, or throw 'not found' if no tokens were found
    // Check token ownership before revokation. Do not revoke unowned tokens, log and flag as potential suspicious activity.
    // If Nothing was revoked, respond accordingly
    
    res.status(500).json({ message: 'Token revokation has not yet been implemented.' })
  }

  // Revokes all token families for current user
  async revokeAll(req: Request, res: Response): Promise<void> {
    const user = req.user as HydratedDocument<IUser>;
    await AuthService.revokeAll(user._id);
    res.status(200).json({ message: 'All logins terminated succesfully' })
  }

  // TODO
  async resetPassword(_req: Request, res: Response): Promise<void> {
    res.status(500).send('Password resetting has not yet been implemented.');
  }

  // TODO
  // Verify user's email address
  async verifyEmail(_req: Request, res: Response): Promise<void> {
    // Using a mailer event:
    // > Send user a confirmation link containing a temporary, statelessly veriafiable token with a claim to subject user
    // In controller:
    // > Decode token, verify that user exists and is eligible for email confirmation
    // > Update user email confirmation status

    res.status(500).send('Email verification has not yet been implemented.');
  }

}

const instance = AuthController.get();

export { instance as AuthController }
import { Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';

import { User } from '@server/models/user.schema';
import { AuthService } from '@services/auth.service';
import { RefreshToken } from '@models/refresh-token.schema';


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
  async register(req: Request, res: Response) {
    try {
      const newUser = await new User(req.body).save();
      const accessToken = await AuthService.generateAccessToken(newUser._id);
      const refreshToken = await AuthService.generateRefreshToken(newUser._id);
      delete newUser.password;
      res.status(201)
      .cookie('refreshToken', refreshToken.token, {
        httpOnly: true, 
        expires: refreshToken.expires, 
        secure: true, 
        path: '/auth'
      })
      .json({ user: newUser, accessToken: accessToken });
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
        res.status(500).json({message: error.message});
      } else {
        console.log('Unkown error: ', err);
      }
    }
  }

  // Authenticates user with credentials
  async login(req: Request, res: Response) {
    const {username, email, password } = req.body;

    if (!username && !email) res.status(400).send({message: 'A username or email is required to login'});
    if (!password) res.status(400).send({message: 'A password is required to login'});

    const user = await User.findOne({$or: [
      {username: username},
      {email: email}
    ]}).exec();

    if (!user) {    // User not found
      res.status(400).send({mesage: 'Please check that the username or email is correct'});
    } else if (password && user.checkPassword(password)) {  // Password does not match
      res.status(400).send({message: 'Incorrect username/email or password'});
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
  async logout(req: Request, res: Response) {
    // (?) TODO: Verify that requesting user matches RT owner
    if (!req.cookies.refreshToken) res.status(400).json({message: 'Nothing to revoke'});
    const refreshToken = await RefreshToken.findOne({token: req.cookies.refreshToken}).exec();
    if (!refreshToken) res.status(400).json({message: 'Invalid refresh token'});
    await AuthService.revokeRefreshTokens(refreshToken.family_root);
    res.status(200).json({message: 'Logged out successfully'});
  }

  // Generate new access token against a refresh token, rotate refresh token.
  async refresh(req: Request, res: Response) {
    // Find and validate provided refresh token
    // > Can token be found: non-existent or removed, error
    // > Has token been used: possible replay, revoke token vamily
    // > Has token expired: re-authentication required, unauthorized
    // Generate new access token for refresh token's user
    if (!req.cookies.refreshToken) res.status(400).json({message: 'Missing refresh token'});
    const oldRefreshToken = await RefreshToken.findOne({token: req.cookies.refreshToken}).exec();
    if (!oldRefreshToken) res.status(400).json({message: 'Invalid refresh token'});
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

  // TODO
  // Generates a list of user's active sessions (refresh token families)
  async activeSessions(_req: Request, res: Response) {
    // The newest token of a token family should always be unused.
    // Get all active sessions by querying for user: req.user._id and isUsed: false.
    // Expired tokens can be excluded with expires: {$lte: dayjs().toDate()}, same for family expiration
    // return values should contain at least a root token ID to use with revokation requests.

    // NOTE: Implementing token families as a DB model would simplify handling at the cost of additional DB queries
    // NOTE: Token family model is RECOMMENDED when storing additional information on sessions (e.g. Session platform, location, issue date)
    // -> Storing additional details in every token takes up space unnecessarily, only storing and finding some details in root tokens would require additional queries anyway
    /*
    [
      {
        id: token._id,
        current_expiration: token.expires
        maximum_expiration: token.family_expires
        ... other details ...
      },
      ...
    ]
    */

    res.status(500).json({ message: 'Active session listing is not implemented yet.' })
  }

  // NOTE: Admins should also have the ability to revoke users' tokens. This should be implemented separately

  // TODO
  // Revokes one or more refresh token families.
  async revoke(_req: Request, res: Response) {
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
    
    res.status(500).json({ message: 'ID-based token revokation has not yet been implemented.' })
  }

  // TODO
  async resetPassword(_req: Request, res: Response) {
    res.status(200).send('Password resetting has not yet been implemented.');
  }

  // TODO
  // Verify user's email address
  async verifyEmail(_req: Request, res: Response) {
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
import { Request, Response } from 'express';
import { HydratedDocument, Error as MongooseError } from 'mongoose';

import { User, IUser } from '@server/models/user.schema';
import { AuthService } from '@services/auth.service';
import { RefreshToken } from '@models/refresh-token.schema';


export class AuthController {

  // Creates and authenticates new user
  async register(req: Request, res: Response) {
    const newUser: HydratedDocument<IUser> = new User(req.body)
    try {
      await newUser.save()
      const accessToken = await this.authService.generateAccessToken(newUser);
      const refreshToken = await this.authService.generateRefreshToken(newUser);
      res.status(201)
      .cookie('refreshToken', refreshToken.token, {
        httpOnly: true, 
        expires: refreshToken.token_expires, 
        secure: true, 
        path: '/auth'
      })
      .json({ user: newUser, accessToken: accessToken });
    } catch (err) {
      // TODO: Move error handling to dedicated middleware
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

  // Authenticate user with credentials
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

    const accessToken = await this.authService.generateAccessToken(user);
    const refreshToken = await this.authService.generateRefreshToken(user);
    res.status(200)
    .cookie('refreshToken', refreshToken.token, {
      httpOnly: true, 
      expires: refreshToken.token_expires, 
      secure: true, 
      path: '/auth'
    })
    .json({ user: user, accessToken: accessToken });
  }

  async logout(req: Request, res: Response) {
    // TODO?: Verify that requesting user matches RT owner

    if (!req.cookies.refreshToken) res.status(400).json({message: 'Nothing to revoke'});
    const refreshToken = await RefreshToken.findOne({token: req.cookies.refreshToken}).exec();
    if (!refreshToken) res.status(400).json({message: 'Invalid refresh token'});
    await this.authService.revokeRefreshTokens(refreshToken);
    res.status(200).json({message: 'Logged out successfully'});
  }

  async refresh(_req: Request, res: Response) {
    // Generate new access token against a refresh token, rotate refresh token.

    // Find and validate provided refresh token
    // > Can token be found: non-existent or removed, error
    // > Has token been used: possible replay, revoke token vamily
    // > Has token expired: re-authentication required, unauthorized
    // Generate new access token for refresh token's user

    res.status(200).send('Access token refreshing has not yet been implemented');
  }

  async resetPassword(_req: Request, res: Response) {
    // Verify user's email address

    // Using a mailer event:
    // > Send user a confirmation link containing a temporary, statelessly veriafiable token with a claim to subject user
    // In controller:
    // > Decode token, verify that user exists and is eligible for email confirmation
    // > Update user email confirmation status

    res.status(200).send('Password resetting has not yet been implemented.');
  }

  async verifyEmail(_req: Request, res: Response) {
    // Verify user's email address
    res.status(200).send('Email verification has not yet been implemented.');
  }

  private authService = new AuthService();
}
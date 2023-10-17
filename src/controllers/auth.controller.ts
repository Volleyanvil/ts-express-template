import { Request, Response } from 'express';
// import * as mongoose from 'mongoose';

// import * as Jwt from 'jwt-simple';

// import { User } from '@server/models/user.schema';


export class AuthController {
  async register() {
    // Creates and authenticates new user
  }
  async login() {
    // Authenticate user with credentials
  }
  async logout(_req: Request, res: Response) {
    // Generate new access token against a refresh token, rotate refresh token.

    // Check that provided tokens are valid
    // Revoke refresh token family.

    res.status(200).send('Logout has not been implemented');
  }
  async refreshToken(_req: Request, res: Response) {
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
}

/*
    // Find user mathching provided credentials and provides a token
    const {username, email, password } = req.body;

    if (!username && !email) res.status(400).send({message: 'A username or email is required to login'});
    if (!password) res.status(400).send({message: 'A password must be specified to login'});

    const user = await User.findOne({$or: [
      {username: username},
      {email: email}
    ]});

    if (!user) {    // User not found
      res.status(400).send({mesage: 'Please check that the username or email is correct'});
    } else if (password && user.checkPassword(password)) {  // Password does not match
      res.status(400).send({message: 'Incorrect username/email or password'});
    }
    res.locals.data = {};
*/
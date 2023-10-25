import dayjs from 'dayjs';  // Use Dayjs instead of moment (maintenance mode)
import * as Jwt from 'jwt-simple';
import { HydratedDocument, Types } from 'mongoose';
import { IRefreshToken, RefreshToken } from '@models/refresh-token.schema';
import { 
  ACCESS_TOKEN_SECRET, 
  ACCESS_TOKEN_EXPIRATION, 
  ACCESS_TOKEN_ALG, 
  REFRESH_TOKEN_SECRET, 
  REFRESH_TOKEN_EXPIRATION, 
  REFRESH_TOKEN_FAMILY_EXPIRATION 
} from '@config/environment.config';


// TODO: Handle ENV variables in environment.config and import

export class AuthService {

  // Generates an returns a new JWT access token for user
  async generateAccessToken (userId: Types.ObjectId): Promise<string> {
    // https://github.com/hokaccha/node-jwt-simple#readme
    const secretKey = ACCESS_TOKEN_SECRET;  // Import env variable from environment.config instead
    const alg = ACCESS_TOKEN_ALG as Jwt.TAlgorithm;
    const duration = ACCESS_TOKEN_EXPIRATION;

    // https://www.rfc-editor.org/rfc/rfc7519#section-2
    // iat, exp must be NumericDates (seconds since epoch) use dayjs unix()
    const tokenPayload = {
      exp: dayjs().add(duration, 'minutes').unix(),
      iat: dayjs().unix(),
      sub: userId,
    }

    return Jwt.encode(tokenPayload, secretKey, alg)
  }

  // Generates and returns a new refresh token for user with optional params when using an existing token family.
  async generateRefreshToken(userId: Types.ObjectId, tokenFamily?: { exp: Date, root: string }): Promise<HydratedDocument<IRefreshToken>> {
    const secretKey = REFRESH_TOKEN_SECRET; 
    const alg = ACCESS_TOKEN_ALG as Jwt.TAlgorithm;
    const now = dayjs();
    const expires = now.add(REFRESH_TOKEN_EXPIRATION, 'days');

    const tokenPayload = {
      exp: expires.unix(),
      iat: now.unix(),
      sub: userId,
    }
    const token = Jwt.encode(tokenPayload, secretKey, alg);
    // NOTE: RT details are stored in DB. Tokens can also be random, hard-to-guess strings.

    const newRToken = new RefreshToken({
      token: token, 
      user: userId, 
      expires: expires.toDate(), 
      family_expires: tokenFamily.exp || now.add(REFRESH_TOKEN_FAMILY_EXPIRATION, 'days').toDate(),
      family_root: tokenFamily.root || undefined,
    });
    newRToken.save();

    return newRToken;
  }

  // Rotates refresh token, returns new token pair or revokes refresh tokens and throws if provided token is invalid
  async rotateToken(oldRToken: HydratedDocument<IRefreshToken>): Promise<{ accessToken: string, refreshToken: HydratedDocument<IRefreshToken> }> {
     // Revoke used token, throw error. NOTE: should be logged as potential replay attack.
    if (oldRToken.isUsed) {
      this.revokeRefreshTokens(oldRToken.family_root);
      throw new Error('Token has been used');
    }

    // Check for token/family expiration
    if (dayjs().toDate() > oldRToken.expires || dayjs().toDate() > oldRToken.family_expires) {
      this.revokeRefreshTokens(oldRToken.family_root);
      throw new Error('Refresh token has expired');
    }

    // Delete old token
    RefreshToken.deleteOne({ _id: oldRToken._id});

    // Generate new tokens
    const accessToken = await this.generateAccessToken(oldRToken.user);
    const refreshToken = await this.generateRefreshToken(oldRToken.user, {exp: oldRToken.family_expires, root: oldRToken.family_root});
    return { accessToken, refreshToken };
  }

  // Revokes a refresh token family, returns number of deleted documents.
  async revokeRefreshTokens(refreshTokenRoot: string): Promise<number> {
    const deleted = await RefreshToken.deleteMany({ family_root: refreshTokenRoot});
    return deleted.deletedCount;
  }
}
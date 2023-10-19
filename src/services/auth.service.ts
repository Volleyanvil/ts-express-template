import dayjs from 'dayjs';  // Use Dayjs instead of moment (maintenance mode)
import * as Jwt from 'jwt-simple';
import { HydratedDocument, Types } from 'mongoose';
import { IRefreshToken, RefreshToken } from '@models/refresh-token.schema';


export class AuthService {

  async generateAccessToken (userId: Types.ObjectId): Promise<string> {
    // https://github.com/hokaccha/node-jwt-simple#readme
    const secretKey = process.env.ACCESS_TOKEN_SECRET;  // Import env variable from environment.config instead
    const alg = process.env.ACCESS_TOKEN_ALG as Jwt.TAlgorithm;
    const duration = parseInt(process.env.ACCESS_TOKEN_EXPIRATION);

    // https://www.rfc-editor.org/rfc/rfc7519#section-2
    // iat, exp must be NumericDates (seconds since epoch) use dayjs unix()
    const tokenPayload = {
      exp: dayjs().add(duration, 'minutes').unix(),
      iat: dayjs().unix(),
      sub: userId,
    }

    return Jwt.encode(tokenPayload, secretKey, alg)
  }

  async generateRefreshToken(userId: Types.ObjectId, tokenFamily?: { exp: Date, root: string }): Promise<HydratedDocument<IRefreshToken>> {
    // TODO: Handle auth-related env variables in environment.config and import here
    // NOTE: RT details are stored in DB. Tokens can also be random, hard-to-guess strings.

    const secretKey = process.env.REFRESH_TOKEN_SECRET; 
    const alg = process.env.ACCESS_TOKEN_ALG as Jwt.TAlgorithm;
    const now = dayjs();
    const expires = now.add(parseInt(process.env.REFRESH_TOKEN_EXPIRATION), 'days');

    const tokenPayload = {
      exp: expires.unix(),
      iat: now.unix(),
      sub: userId,
    }
    const token = Jwt.encode(tokenPayload, secretKey, alg);

    const newRToken = new RefreshToken({
      token: token, 
      user: userId, 
      token_expires: expires.toDate(), 
      family_expires: tokenFamily.exp || now.add(parseInt(process.env.REFRESH_TOKEN_FAMILY_EXPIRATION), 'days').toDate(),
      family_root: tokenFamily.root || undefined,
    });
    newRToken.save();

    return newRToken;
  }

  async roteteToken(rToken: string): Promise<{ newAToken: string, newRToken: HydratedDocument<IRefreshToken> }> {
    // NOTE: Populated document is not of type HydratedDocument<interface>! 
    const oldRToken = await RefreshToken.findOne({token: rToken}).exec();
    const userId: Types.ObjectId = oldRToken.user;

     // Revoke used token, throw error. NOTE: should be logged as potential replay attack.
    if (oldRToken.token_used) {
      this.revokeRefreshTokens(oldRToken.family_root);
      throw new Error('Token has been used');
    }

    // Check for token/family expiration
    if (dayjs().toDate() > oldRToken.token_expires || dayjs().toDate() > oldRToken.family_expires) {
      this.revokeRefreshTokens(oldRToken.family_root);
      throw new Error('Refresh token has expired');
    }

    // Delete old token
    RefreshToken.deleteOne({ _id: oldRToken._id});

    // Generate new tokens
    const newRToken = await this.generateRefreshToken(userId, {exp: oldRToken.family_expires, root: oldRToken.family_root});
    const newAToken = await this.generateAccessToken(userId);
    return { newAToken, newRToken };
  }

  // Revokes a refresh token family, returns number of deleted documents.
  async revokeRefreshTokens(refreshTokenRoot: string): Promise<number> {
    const deleted = await RefreshToken.deleteMany({ family_root: refreshTokenRoot});
    // Disabled 'not found' errors in services. ID-based revokation and logout may handle errors differently.
    // if (deleted.deletedCount === 0) throw new Error('Refresh Token not found');
    return deleted.deletedCount;
  }
}
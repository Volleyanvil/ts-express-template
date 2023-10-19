import dayjs from 'dayjs';  // Use Dayjs instead of moment (maintenance mode)
import * as Jwt from 'jwt-simple';
import { HydratedDocument } from 'mongoose';
import { IUser } from '@server/models/user.schema';
import { IRefreshToken, RefreshToken } from '@models/refresh-token.schema';


export class AuthService {

  async generateAccessToken (user: HydratedDocument<IUser>): Promise<string> {
    // https://github.com/hokaccha/node-jwt-simple#readme
    const secretKey = process.env.ACCESS_TOKEN_SECRET;  // Import env variable from environment.config instead
    const alg = process.env.ACCESS_TOKEN_ALG as Jwt.TAlgorithm;
    const duration = parseInt(process.env.ACCESS_TOKEN_EXPIRATION);

    // https://www.rfc-editor.org/rfc/rfc7519#section-2
    // iat, exp must be NumericDates (seconds since epoch) use dayjs unix()
    const tokenPayload = {
      exp: dayjs().add(duration, 'minutes').unix(),
      iat: dayjs().unix(),
      sub: user._id,
    }

    return Jwt.encode(tokenPayload, secretKey, alg)
  }

  async generateRefreshToken(user: HydratedDocument<IUser>, rToken?: HydratedDocument<IRefreshToken>): Promise<HydratedDocument<IRefreshToken>> {
    // TODO: Handle auth-related env variables in environment.config and import here
    // NOTE: RT details are stored in DB. Tokens can also be random, hard-to-guess strings.

    const secretKey = process.env.REFRESH_TOKEN_SECRET; 
    const alg = process.env.ACCESS_TOKEN_ALG as Jwt.TAlgorithm;
    const expires = dayjs().add(parseInt(process.env.REFRESH_TOKEN_EXPIRATION), 'days');
    const familyExpires = dayjs().add(parseInt(process.env.REFRESH_TOKEN_FAMILY_EXPIRATION), 'days').toDate();

    const tokenPayload = {
      exp: expires.unix(),
      iat: dayjs().unix(),
      sub: user._id,
    }
    const token = Jwt.encode(tokenPayload, secretKey, alg);

    const newRToken = new RefreshToken({
      token: token, 
      user: user, 
      token_expires: expires.toDate(), 
      family_expires: rToken.family_expires || familyExpires,
      family_root: rToken.family_root || undefined,
    });
    newRToken.save();

    return newRToken;
  }

  // Rotates refresh token and returns new tokens (AT & RT) or throws
  async tokenRotation(user: HydratedDocument<IUser>, oldToken: HydratedDocument<IRefreshToken>): Promise<{ newAToken: string, newRToken: HydratedDocument<IRefreshToken> }> {
    // Check for token reuse
    if (oldToken.token_used) {
      this.revokeRefreshTokens(oldToken);
      throw new Error('Invalid Refresh Token');
    }
    // Check for token/family expiration
    if (dayjs().toDate() > oldToken.token_expires || dayjs().toDate() > oldToken.family_expires) {
      this.revokeRefreshTokens(oldToken);
      throw new Error('Expired Refresh Token');
    }
    RefreshToken.deleteOne({ _id: oldToken._id});

    const newRToken = await this.generateRefreshToken(user, oldToken);
    const newAToken = await this.generateAccessToken(user);
    return { newAToken, newRToken };
  }

  // Revokes a refresh token family, returns number of deleted documents.
  async revokeRefreshTokens(refreshToken: HydratedDocument<IRefreshToken>): Promise<number> {
    const deleted = await RefreshToken.deleteMany({ family_root: refreshToken.family_root});
    // Disabled 'not found' errors in services. ID-based revokation and logout may handle errors differently.
    // if (deleted.deletedCount === 0) throw new Error('Refresh Token not found');
    return deleted.deletedCount;
  }
}
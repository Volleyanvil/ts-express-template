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
import { TokenFamily } from '@models/token-family.schema';


class AuthService {

  private static instance: AuthService;

  constructor() {}

  static get(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Generates an returns a new JWT access token for user
  async generateAccessToken (userId: Types.ObjectId, duration: number = null): Promise<string> {
    const tokenPayload = {
      exp: dayjs().add(duration || ACCESS_TOKEN_EXPIRATION, 'minutes').unix(),
      iat: dayjs().unix(),
      sub: userId,
    }
    return Jwt.encode(tokenPayload, ACCESS_TOKEN_SECRET, ACCESS_TOKEN_ALG as Jwt.TAlgorithm)
  }

  // Generates and returns a new refresh token for user with optional params when using an existing token family.
  async generateRefreshToken(userId: Types.ObjectId, tokenFamily?: { exp: Date, root: Types.ObjectId }): Promise<HydratedDocument<IRefreshToken>> {
    const now = dayjs();
    const expires = now.add(REFRESH_TOKEN_EXPIRATION, 'days');
    const familyExpires = tokenFamily?.exp || now.add(REFRESH_TOKEN_FAMILY_EXPIRATION, 'days').toDate();
    let familyRoot = tokenFamily?.root || undefined;

    // Generate token string, can also be random data
    const tokenPayload = {
      exp: expires.unix(),
      iat: now.unix(),
      sub: userId,
    }
    const token = Jwt.encode(tokenPayload, REFRESH_TOKEN_SECRET, 'HS256');

    // Generate a new family if not defined
    if (familyRoot === undefined) {
      const newFamily = await TokenFamily.create({
        user: userId,
        expires: familyExpires,
      });
      familyRoot = newFamily._id;
    }

    const newRToken = await RefreshToken.create({
      token: token, 
      user: userId, 
      expires: expires.toDate(), 
      familyExpires: familyExpires,
      familyRoot: familyRoot,
    });

    return newRToken;
  }

  // Rotates refresh token, returns new token pair or revokes refresh tokens and throws if provided token is invalid
  async rotateToken(oldRToken: HydratedDocument<IRefreshToken>): Promise<{ accessToken: string, refreshToken: HydratedDocument<IRefreshToken> }> {
     // Revoke used token, throw error. NOTE: should be logged as potential replay attack.
    if (oldRToken.isUsed) {
      this.revokeRefreshTokens(oldRToken.familyRoot);
      throw new Error('Token has been used');
    }

    // Check for token/family expiration
    if (dayjs().toDate() > oldRToken.expires || dayjs().toDate() > oldRToken.familyExpires) {
      this.revokeRefreshTokens(oldRToken.familyRoot);
      throw new Error('Refresh token has expired');
    }

    // Mark old token as used
    oldRToken.isUsed = true;
    oldRToken.save();

    // Generate new tokens
    const accessToken = await this.generateAccessToken(oldRToken.user);
    const refreshToken = await this.generateRefreshToken(oldRToken.user, {exp: oldRToken.familyExpires, root: oldRToken.familyRoot});
    return { accessToken, refreshToken };
  }

  // Revokes a refresh token family, returns number of deleted tokens.
  async revokeRefreshTokens(refreshTokenRoot: Types.ObjectId): Promise<number> {
    const deleted = await RefreshToken.deleteMany({ familyRoot: refreshTokenRoot }).exec();
    await TokenFamily.deleteOne({ _id: refreshTokenRoot }).exec();
    return deleted.deletedCount;
  }

  // Revokes 
  async revokeAll(userId: Types.ObjectId): Promise<void> {
    const families = await TokenFamily.find({ user: userId }).distinct('_id').exec();
    await RefreshToken.deleteMany({ familyRoot: {$in: families} }).exec();
    await TokenFamily.deleteMany({ _id: {$in: families} }).exec();
  }

}

const instance = AuthService.get();

export { instance as AuthService }
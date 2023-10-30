import { Schema, model, Types } from 'mongoose';
import { TokenFamily } from '@models/token-family.schema';


/**Rotation and raplay attack prevention notes
 * 
 * Maximum token lifetime and idle lifetime:
 * - A token family has a maximum duration after which re-authorization is always required
 * - Each refresh token has its own individual, shorter lifetime, after which the token and family expire
 * 
 * A token family should be revoked when:
 *  a) User sends a valid logout or revoke request
 *  b) The latest, unused token has expired
 *  c) The token family has expired
 *  d) A token gets reused
 * 
 * Recommended storage and delivery:
 * - Store Access tokens in session or local storage
 *   * The short lifetime should mitigate the risks of XSS attacks.
 *   * Should additional security be necessary, track and limit the times an AT can be used auth-server-side.
 *   * DO NOT store ATs in cookies, where they can be used in CSRF attacks.
 * - Refresh tokens should NOT be stored in session or local storage, since they have much longer lifetimes.
 *   * For SPAs, storing the RT in an httpOnly cookie (maybe with path restrictions) is recommended
 *     > httpOnly cookies cannot be accessed by JS in a secure browser
 *     > Refresh tokens cannot be used to access or modify resources in CSRF attacks
 *   * For native apps / secured clients, local secured storage should be used
 *   * httpOnly cookies should be used by default, and local storage when a trusted client can be verified.
 */

export interface IRefreshToken {
  token: string,
  user: Types.ObjectId,
  isUsed: boolean,
  expires: Date,
  familyExpires: Date,
  familyRoot: Types.ObjectId,
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  token: { type: String, required: true, unique: true, index: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isUsed: { type: Boolean, default: false },
  expires: { type: Date, required: true },
  familyExpires: { type: Date, required: true },
  familyRoot: { type: Schema.Types.ObjectId, ref: 'TokenFamily', default: undefined}
},
{ 
  timestamps: true 
});

// If token is unused, update token family. 
RefreshTokenSchema.pre('save', async function(): Promise<void> {
  if (!this.isUsed && this.familyRoot !== undefined) {
    const family = await TokenFamily.findById(this.familyRoot);
    family.current = this._id;
    await family.save();
  }
});

export const RefreshToken = model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
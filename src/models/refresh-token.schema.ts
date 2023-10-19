import { Schema, model, Types } from 'mongoose';


// Using a separete token family model as a wrapper would make it less cumbersome to purge expired token families
// earlier (i.e. find families that have expired due to inactivity).
// No security benefits. Could reduce total DB size in some cases

/**Rotation and raplay attack prevention notes
 * 
 * Maximum token lifetime and idle lifetime:
 * - A token family has a maximum duration after which re-authorization is always required
 * - Each refresh token also has its own, shorter duration, during which it must be used, or it expires
 * 
 * family_root holds the value of the first token in a token family, and is shared between all tokens in that family
 * 
 * A token family is revoked when:
 *  a) User sends a logout request with a valid token
 *  b) The latest token has expired (Family is purged from DB upon detection or in a routine based on family expiration)
 *  c) The token family has expired (Either purged from database, or revoked upon detection)
 *  d) A token gets reused ()
 * 
 * Recommended client-side storage and delivery
 * - Store Access tokens in session or in local storage
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
  family_expires: Date,
  family_root: string,
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  token: { type: String, required: true, unique: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isUsed: { type: Boolean, default: false },
  expires: { type: Date, required: true },
  family_expires: { type: Date, required: true },
  family_root: { type: String, default: undefined }
},
{ 
  timestamps: true 
});

// Add token indexing

// If token does not belong to a token family, set it as the root of a new family
RefreshTokenSchema.pre('save', function() {
  if (this.family_root === undefined) this.family_root = this.token;
});

export const RefreshToken = model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
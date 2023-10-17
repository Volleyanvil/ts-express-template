import { Schema, model, Types } from 'mongoose';

interface IRefreshToken {
  token: string,
  user: Types.ObjectId,
  token_expires: Date,
  family_expires: Date,
  family_root: string,
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  token: { type: String, required: true, unique: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token_expires: { type: Date, required: true },
  family_expires: { type: Date, required: true },
  family_root: { type: String, default: undefined }
},
{ 
  timestamps: true 
});

// If token does not belong to a token family, set it as the root of a new family
RefreshTokenSchema.pre('save', function() {
  if (this.family_root === undefined) this.family_root = this.token;
});

export const RefreshToken = model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
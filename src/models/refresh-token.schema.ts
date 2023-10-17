import { Schema, model, Types } from 'mongoose';

interface IRefreshToken {
  token: string,
  user: Types.ObjectId,
  exp: Date,
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  token: { type: String, required: true, unique: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  exp: { type: Date, required: true },
},
{ 
  timestamps: true 
});

export const RefreshToken = model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
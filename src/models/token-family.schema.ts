import { Schema, model, Types } from 'mongoose';


export interface ITokenFamily {
  user: Types.ObjectId,
  current: Types.ObjectId,
  expires: Date,
}

const TokenFamilySchema = new Schema<ITokenFamily>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true , index: true},
  current: { type: Schema.Types.ObjectId, ref: 'RefreshToken', required: true },
  expires: { type: Date, required: true },
},
{ 
  timestamps: true 
});

export const TokenFamily = model<ITokenFamily>('TokenFamily', TokenFamilySchema);
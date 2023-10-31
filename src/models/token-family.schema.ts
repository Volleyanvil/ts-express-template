import { Schema, model, Types } from 'mongoose';


export interface ITokenFamily {
  user: Types.ObjectId,
  current: Types.ObjectId,
  expires: Date,
}

const TokenFamilySchema = new Schema<ITokenFamily>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true , index: true},
  current: { type: Schema.Types.ObjectId, ref: 'RefreshToken'},
  expires: { type: Date, required: true , expires: '1h'},
},
{ 
  timestamps: true 
});

export const TokenFamily = model<ITokenFamily>('TokenFamily', TokenFamilySchema);
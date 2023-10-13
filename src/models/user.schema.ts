import { Schema, model } from 'mongoose';

enum ROLE {
  admin = 'admin',
  user = 'user',
}

enum STATUS {
  registered = 'registered',
  verified = 'verified',
}

interface IUser {
  username: string,
  firstName?: string,
  lastName?: string,
  email: string,
  status: STATUS
  role: ROLE,
  password: string,
}

export const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true },
  status: { type: String, enum: STATUS, default: STATUS.registered },
  role: { type: String, enum: ROLE, default: ROLE.user },
  password: { type: String },
},
{ 
  timestamps: true 
});

export const User = model<IUser>('User', UserSchema);
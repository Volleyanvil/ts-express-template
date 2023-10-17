import { Model, Schema, model } from 'mongoose';
import * as Bcrypt from 'bcrypt';

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

interface IUserMethods {
  checkPassword(password: string): boolean;
}

interface IUserQueryHelpers {}

type UserModel = Model<IUser, IUserQueryHelpers, IUserMethods>

export const UserSchema = new Schema<IUser, UserModel, IUserMethods>({
  username: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  status: { type: String, enum: STATUS, default: STATUS.registered },
  role: { type: String, enum: ROLE, default: ROLE.user },
  password: { type: String, select: false },
},
{ 
  timestamps: true 
});

// Replace password filed contents with hash if value has been modified
UserSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password')) return next();
    this.password = await Bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// Compare provided cleartext password with stored hash value
UserSchema.method('checkPassword', async function(password: string) {
  return await Bcrypt.compare(password, this.password);
});

export const User = model<IUser, UserModel>('User', UserSchema);
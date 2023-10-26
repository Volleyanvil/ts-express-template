import { Model, Schema, model } from 'mongoose';
import * as Bcrypt from 'bcrypt';


enum ROLE {
  admin = 'admin',
  user = 'user',
}

export interface IUser {
  username: string,
  firstName?: string,
  lastName?: string,
  email: string,
  isActive: boolean
  role: ROLE,
  password: string,
}

interface IUserMethods {
  checkPassword(password: string): boolean;
  fullName(): string;
}

interface IUserQueryHelpers {}

type UserModel = Model<IUser, IUserQueryHelpers, IUserMethods>

const UserSchema = new Schema<IUser, UserModel, IUserMethods>({
  username: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: false },
  role: { type: String, enum: ROLE, default: ROLE.user },
  password: { type: String, select: false },
},
{ 
  timestamps: true 
});

// Replace password contents with hash if value has been modified
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
UserSchema.method('checkPassword', async function checkPassword(password: string) {
  return await Bcrypt.compare(password, this.password);
});

// Compare provided cleartext password with stored hash value
UserSchema.method('fullName', async function fullName() {
  return this.firstName + ' ' + this.lastName;
});

export const User = model<IUser, UserModel>('User', UserSchema);
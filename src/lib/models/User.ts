import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole } from '../../types';

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: UserRole;
  avatar?: string;
  handle?: string;
  companyName?: string;
  specialization?: string;
  location?: string;
  tools?: string[];
  hourlyRate?: number;
  bio?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    salt: { type: String, required: true },
    role: { type: String, enum: ['brand', 'creator', 'admin'], required: true },
    avatar: { type: String },
    handle: { type: String },
    companyName: { type: String },
    specialization: { type: String },
    location: { type: String },
    tools: [{ type: String }],
    hourlyRate: { type: Number },
    bio: { type: String },
    isVerified: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

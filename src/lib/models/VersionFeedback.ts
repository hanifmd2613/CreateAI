import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole } from '../../types';

export interface IVersionFeedback extends Document {
  id: string;
  engagementId: string;
  versionId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  timestampOffset?: number;
  coordinates?: { x: number; y: number };
  comment: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedInVersion?: number;
  createdAt: Date;
  updatedAt: Date;
}

const VersionFeedbackSchema = new Schema<IVersionFeedback>({
  id: { type: String, required: true, unique: true, index: true },
  engagementId: { type: String, required: true, index: true },
  versionId: { type: String, required: true, index: true },
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  authorRole: { type: String, enum: ['brand', 'creator'], required: true },
  timestampOffset: { type: Number },
  coordinates: {
    x: Number,
    y: Number,
  },
  comment: { type: String, required: true },
  resolved: { type: Boolean, default: false, index: true },
  resolvedAt: { type: Date },
  resolvedInVersion: { type: Number },
}, {
  timestamps: true,
});

export const VersionFeedbackModel: Model<IVersionFeedback> =
  mongoose.models.VersionFeedback || mongoose.model<IVersionFeedback>('VersionFeedback', VersionFeedbackSchema);

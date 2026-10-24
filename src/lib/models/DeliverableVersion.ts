import mongoose, { Schema, Document, Model } from 'mongoose';
import { VersionReviewStatus } from '../../types';

export interface IDeliverableVersion extends Document {
  id: string;
  engagementId: string;
  versionNumber: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileChecksum: string;
  uploaderId: string;
  uploaderName: string;
  submittedAt: Date;
  generationNotes: string;
  status: VersionReviewStatus;
  mediaMetadata?: {
    format?: string;
    width?: number;
    height?: number;
    aspectRatio?: string;
    durationSeconds?: number;
    fileSizeBytes?: number;
    isDecodable?: boolean;
    checksumSha256?: string;
  };
}

const DeliverableVersionSchema = new Schema<IDeliverableVersion>({
  id: { type: String, required: true, unique: true, index: true },
  engagementId: { type: String, required: true, index: true },
  versionNumber: { type: Number, required: true, index: true },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileChecksum: { type: String, required: true },
  uploaderId: { type: String, required: true },
  uploaderName: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  generationNotes: { type: String, default: '' },
  status: {
    type: String,
    enum: ['DRAFT', 'UNDER_REVIEW', 'REVISION_REQUESTED', 'APPROVED', 'SUPERSEDED'],
    default: 'DRAFT',
    index: true,
  },
  mediaMetadata: {
    format: String,
    width: Number,
    height: Number,
    aspectRatio: String,
    durationSeconds: Number,
    fileSizeBytes: Number,
    isDecodable: Boolean,
    checksumSha256: String,
  }
}, {
  timestamps: true,
});

DeliverableVersionSchema.index({ engagementId: 1, versionNumber: 1 });

export const DeliverableVersionModel: Model<IDeliverableVersion> =
  mongoose.models.DeliverableVersion || mongoose.model<IDeliverableVersion>('DeliverableVersion', DeliverableVersionSchema);

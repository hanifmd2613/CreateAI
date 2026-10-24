import mongoose, { Schema, Document, Model } from 'mongoose';
import { DeliveryCheckStatus, SingleDeliveryCheck } from '../../types';

export interface IDeliveryCheck extends Document {
  id: string;
  versionId: string;
  engagementId: string;
  overallStatus: DeliveryCheckStatus;
  checks: SingleDeliveryCheck[];
  extractedMetadata: {
    format?: string;
    width?: number;
    height?: number;
    aspectRatio?: string;
    durationSeconds?: number;
    fileSizeBytes?: number;
    isDecodable?: boolean;
    checksumSha256?: string;
  };
  inspectedAt: Date;
  actionableGuidance?: string;
}

const DeliveryCheckSchema = new Schema<IDeliveryCheck>({
  id: { type: String, required: true, unique: true, index: true },
  versionId: { type: String, required: true, index: true },
  engagementId: { type: String, required: true, index: true },
  overallStatus: {
    type: String,
    enum: ['PASS', 'FAIL', 'WARNING', 'UNVERIFIABLE'],
    required: true,
    index: true,
  },
  checks: [{
    id: String,
    name: String,
    requirement: String,
    actual: String,
    status: { type: String, enum: ['PASS', 'FAIL', 'WARNING', 'UNVERIFIABLE'] },
    message: String,
    isBlocking: Boolean,
  }],
  extractedMetadata: {
    format: String,
    width: Number,
    height: Number,
    aspectRatio: String,
    durationSeconds: Number,
    fileSizeBytes: Number,
    isDecodable: Boolean,
    checksumSha256: String,
  },
  inspectedAt: { type: Date, default: Date.now },
  actionableGuidance: String,
}, {
  timestamps: true,
});

export const DeliveryCheckModel: Model<IDeliveryCheck> =
  mongoose.models.DeliveryCheck || mongoose.model<IDeliveryCheck>('DeliveryCheck', DeliveryCheckSchema);

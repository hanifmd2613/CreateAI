import mongoose, { Schema, Document, Model } from 'mongoose';
import { EngagementStatus, LicensingStatus, AgreedEngagementTerms } from '../../types';

export interface IEngagement extends Document {
  id: string;
  briefId?: string;
  brandId: string;
  brandName: string;
  brandAvatar?: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  projectTitle: string;
  proposedBudget: string;
  status: EngagementStatus | 'Pending' | 'Accepted' | 'In Production' | 'Completed' | 'Declined';
  licensingStatus: LicensingStatus;
  message: string;
  milestones?: {
    title: string;
    amount: string;
    status: 'Pending' | 'In Escrow' | 'Released';
  }[];
  agreedTerms?: AgreedEngagementTerms;
  currentVersionNumber: number;
  maxRevisions: number;
  revisionsUsed: number;
  declineReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ALL_ENGAGEMENT_STATUSES = [
  // 19 Round 2 FSM states
  'DISCOVERY',
  'SHORTLISTED',
  'CONTACT_PENDING',
  'CONTACTED',
  'CREATOR_RESPONDED',
  'CREATOR_ACCEPTED',
  'CREATOR_DECLINED',
  'SCOPE_CONFIRMATION',
  'LICENSING_REVIEW',
  'AGREEMENT_CONFIRMED',
  'IN_PRODUCTION',
  'DRAFT_SUBMITTED',
  'REVISION_REQUESTED',
  'REVISION_IN_PROGRESS',
  'FINAL_REVIEW',
  'DELIVERY_APPROVED',
  'COMPLETED',
  'CANCELLED',
  'ON_HOLD',
  // Backward-compatible Round 1 legacy states
  'Pending',
  'Accepted',
  'In Production',
  'Completed',
  'Declined',
];

const EngagementSchema = new Schema<IEngagement>({
  id: { type: String, required: true, unique: true, index: true },
  briefId: { type: String, index: true },
  brandId: { type: String, required: true, index: true },
  brandName: { type: String, required: true },
  brandAvatar: { type: String },
  creatorId: { type: String, required: true, index: true },
  creatorName: { type: String, required: true },
  creatorAvatar: { type: String },
  projectTitle: { type: String, required: true },
  proposedBudget: { type: String, required: true },
  status: { 
    type: String, 
    enum: ALL_ENGAGEMENT_STATUSES, 
    default: 'CONTACTED',
    index: true 
  },
  licensingStatus: {
    type: String,
    enum: ['COMPATIBLE', 'MISMATCH', 'UNKNOWN', 'NEEDS_REVIEW'],
    default: 'UNKNOWN',
    index: true
  },
  message: { type: String, required: true },
  milestones: [{
    title: String,
    amount: String,
    status: { type: String, enum: ['Pending', 'In Escrow', 'Released'], default: 'Pending' }
  }],
  agreedTerms: {
    type: Schema.Types.Mixed,
    default: null
  },
  currentVersionNumber: { type: Number, default: 0 },
  maxRevisions: { type: Number, default: 2 },
  revisionsUsed: { type: Number, default: 0 },
  declineReason: { type: String },
}, {
  timestamps: true
});

export const EngagementModel: Model<IEngagement> = mongoose.models.Engagement || mongoose.model<IEngagement>('Engagement', EngagementSchema);

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEngagement extends Document {
  id: string;
  briefId?: string;
  brandId: string;
  brandName: string;
  creatorId: string;
  creatorName: string;
  projectTitle: string;
  proposedBudget: string;
  status: 'Pending' | 'Accepted' | 'In Production' | 'Completed' | 'Declined';
  message: string;
  milestones?: {
    title: string;
    amount: string;
    status: 'Pending' | 'In Escrow' | 'Released';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const EngagementSchema = new Schema<IEngagement>({
  id: { type: String, required: true, unique: true, index: true },
  briefId: { type: String, index: true },
  brandId: { type: String, required: true, index: true },
  brandName: { type: String, required: true },
  creatorId: { type: String, required: true, index: true },
  creatorName: { type: String, required: true },
  projectTitle: { type: String, required: true },
  proposedBudget: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Accepted', 'In Production', 'Completed', 'Declined'], default: 'Pending' },
  message: { type: String, required: true },
  milestones: [{
    title: String,
    amount: String,
    status: { type: String, enum: ['Pending', 'In Escrow', 'Released'], default: 'Pending' }
  }]
}, {
  timestamps: true
});

export const EngagementModel: Model<IEngagement> = mongoose.models.Engagement || mongoose.model<IEngagement>('Engagement', EngagementSchema);

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBrief extends Document {
  id: string;
  brandName: string;
  brandAvatar?: string;
  title: string;
  rawIdea?: string;
  description: string;
  contentType: string;
  style: string;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  duration?: string;
  platforms?: string[];
  budget: string;
  deadline: string;
  commercialUse: 'Full Buyout' | 'Licensed';
  requiredSkills?: string[];
  requiredTools: string[];
  deliverables?: string[];
  status?: 'Open' | 'In Review' | 'In Production';
  applicantsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const BriefSchema = new Schema<IBrief>({
  id: { type: String, required: true, unique: true, index: true },
  brandName: { type: String, required: true },
  brandAvatar: { type: String },
  title: { type: String, required: true, index: true },
  rawIdea: { type: String },
  description: { type: String, required: true },
  contentType: { type: String, required: true, index: true },
  style: { type: String, required: true },
  aspectRatio: { type: String, enum: ['16:9', '9:16', '1:1', '4:5'], required: true, default: '16:9' },
  duration: { type: String, default: '0:30' },
  platforms: [{ type: String }],
  budget: { type: String, required: true },
  deadline: { type: String, required: true },
  commercialUse: { type: String, enum: ['Full Buyout', 'Licensed'], required: true, default: 'Full Buyout' },
  requiredSkills: [{ type: String }],
  requiredTools: [{ type: String, required: true }],
  deliverables: [{ type: String }],
  status: { type: String, enum: ['Open', 'In Review', 'In Production'], default: 'Open' },
  applicantsCount: { type: Number, default: 0 },
}, {
  timestamps: true,
});

export const BriefModel: Model<IBrief> = mongoose.models.Brief || mongoose.model<IBrief>('Brief', BriefSchema);

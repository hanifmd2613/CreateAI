import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBrief extends Document {
  id: string;
  brandId?: string;
  brandName: string;
  brandAvatar?: string;
  assignedCreatorId?: string;
  assignedCreatorName?: string;
  visibility?: 'public' | 'private';
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
  status?: 'Open' | 'In Review' | 'In Production' | 'Assigned' | 'Completed';
  applicantsCount?: number;
  licensingRequirements?: any;
  targetSpecs?: any;
  createdAt: Date;
  updatedAt: Date;
}

const BriefSchema = new Schema<IBrief>({
  id: { type: String, required: true, unique: true, index: true },
  brandId: { type: String, index: true },
  brandName: { type: String, required: true },
  brandAvatar: { type: String },
  assignedCreatorId: { type: String, index: true },
  assignedCreatorName: { type: String },
  visibility: { type: String, enum: ['public', 'private'], default: 'public', index: true },
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
  status: { type: String, enum: ['Open', 'In Review', 'In Production', 'Assigned', 'Completed'], default: 'Open', index: true },
  applicantsCount: { type: Number, default: 0 },
  licensingRequirements: Schema.Types.Mixed,
  targetSpecs: Schema.Types.Mixed,
}, {
  timestamps: true,
});

export const BriefModel: Model<IBrief> = mongoose.models.Brief || mongoose.model<IBrief>('Brief', BriefSchema);


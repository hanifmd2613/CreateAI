import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPortfolioItem {
  id: string;
  title: string;
  type: 'video' | 'image' | 'audio';
  mediaUrl: string;
  thumbnail?: string;
  specificModel?: string;
  model?: string;
  tools?: string[];
  workflowDescription?: string;
  workflow?: string;
  contentType?: string;
  category?: string;
  style?: string;
  targetAudience?: string;
  aspectRatio: string;
  duration?: string;
  language?: string;
  skills?: string[];
  projectRole?: string;
  client?: string;
  projectDate?: string;
  promptSnippet?: string;
  commercialUse?: string;
  verificationStatus?: 'Verified' | 'Pending' | 'Self-Reported';
  views?: string;
  likes?: number;
  featured?: boolean;
  visibility?: 'public' | 'private';
  order?: number;
  steps?: {
    step: number;
    phase: string;
    tool: string;
    description: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IVerificationSignals {
  certifiedPipeline?: string;
  auditDate?: string;
  safetyScore?: number;
  commercialRightsGuaranteed?: boolean;
  identityVerified?: boolean;
  portfolioEvidenceVerified?: boolean;
  toolEvidenceVerified?: boolean;
  workflowEvidenceVerified?: boolean;
  commercialUseDeclared?: boolean;
  platformVerified?: boolean;
}

export interface ICreator extends Document {
  id: string;
  name: string;
  handle: string;
  headline?: string;
  avatar: string;
  coverImage?: string;
  specialization: string;
  categories?: string[];
  bio: string;
  location: string;
  languages?: string[];
  skills: string[];
  tools: string[];
  models?: string[];
  contentTypes?: string[];
  styles?: string[];
  experience?: string;
  yearsOfExperience?: string;
  preferredProjectTypes?: string[];
  hourlyRate: number;
  projectRate?: number;
  pricingModel?: string;
  productionWorkflows?: string[];
  contactEmail?: string;
  availability?: boolean;
  availableNow?: boolean;
  avgTurnaround?: string;
  gender?: 'male' | 'female';
  rating: number;
  reviewCount: number;
  completedProjects: number;
  commercialUse?: string;
  licensingTerms?: any;
  isVerified: boolean;
  verification?: IVerificationSignals;
  verifiedDetails?: IVerificationSignals;
  portfolio: IPortfolioItem[];
  reviews?: {
    id: string;
    brandName: string;
    brandLogo: string;
    rating: number;
    date: string;
    comment: string;
    projectTitle: string;
  }[];
  isUserCreated?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PortfolioItemSchema = new Schema<IPortfolioItem>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'image', 'audio'], required: true },
  mediaUrl: { type: String, required: true },
  thumbnail: { type: String },
  specificModel: { type: String },
  model: { type: String },
  tools: [{ type: String }],
  workflowDescription: { type: String },
  workflow: { type: String },
  contentType: { type: String },
  category: { type: String },
  style: { type: String },
  targetAudience: { type: String },
  aspectRatio: { type: String, required: true, default: '16:9' },
  duration: { type: String },
  language: { type: String },
  skills: [{ type: String }],
  projectRole: { type: String },
  client: { type: String },
  projectDate: { type: String },
  promptSnippet: { type: String },
  commercialUse: { type: String, default: 'Full Buyout' },
  verificationStatus: { type: String, default: 'Verified' },
  views: { type: String },
  likes: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  order: { type: Number, default: 0 },
  steps: [{
    step: Number,
    phase: String,
    tool: String,
    description: String,
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const CreatorSchema = new Schema<ICreator>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, index: true },
  handle: { type: String, required: true },
  headline: { type: String },
  avatar: { type: String, required: true },
  coverImage: { type: String },
  specialization: { type: String, required: true, index: true },
  categories: [{ type: String }],
  bio: { type: String, required: true },
  location: { type: String, required: true, index: true },
  languages: [{ type: String, index: true }],
  skills: [{ type: String, index: true }],
  tools: [{ type: String, index: true }],
  models: [{ type: String }],
  contentTypes: [{ type: String }],
  styles: [{ type: String }],
  experience: { type: String, default: '3+ Years Gen-AI Directing' },
  yearsOfExperience: { type: String },
  preferredProjectTypes: [{ type: String }],
  hourlyRate: { type: Number, required: true, index: true },
  projectRate: { type: Number },
  pricingModel: { type: String, default: 'Hourly / Project' },
  productionWorkflows: [{ type: String }],
  contactEmail: { type: String },
  availability: { type: Boolean, default: true },
  availableNow: { type: Boolean, default: true },
  avgTurnaround: { type: String, default: '48 Hours' },
  gender: { type: String, enum: ['male', 'female'] },
  rating: { type: Number, default: 5.0, index: true },
  reviewCount: { type: Number, default: 1 },
  completedProjects: { type: Number, default: 0 },
  commercialUse: { type: String, default: 'Full Buyout' },
  licensingTerms: Schema.Types.Mixed,
  isVerified: { type: Boolean, default: true },
  verification: {
    certifiedPipeline: String,
    auditDate: String,
    safetyScore: Number,
    commercialRightsGuaranteed: Boolean,
    identityVerified: Boolean,
    portfolioEvidenceVerified: Boolean,
    toolEvidenceVerified: Boolean,
    workflowEvidenceVerified: Boolean,
    commercialUseDeclared: Boolean,
    platformVerified: Boolean,
  },
  verifiedDetails: Schema.Types.Mixed,
  portfolio: [PortfolioItemSchema],
  reviews: [{
    id: String,
    brandName: String,
    brandLogo: String,
    rating: Number,
    date: String,
    comment: String,
    projectTitle: String,
  }],
  isUserCreated: { type: Boolean, default: false }
}, {
  timestamps: true,
});

export const CreatorModel: Model<ICreator> = mongoose.models.Creator || mongoose.model<ICreator>('Creator', CreatorSchema);

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMatchResult extends Document {
  briefId: string;
  creatorId: string;
  semanticScore: number;
  skillScore: number;
  toolScore: number;
  contentTypeScore: number;
  formatScore: number;
  commercialScore: number;
  experienceScore: number;
  finalScore: number;
  reasons: string[];
  createdAt: Date;
}

const MatchResultSchema = new Schema<IMatchResult>({
  briefId: { type: String, required: true, index: true },
  creatorId: { type: String, required: true, index: true },
  semanticScore: { type: Number, required: true, min: 0, max: 100 },
  skillScore: { type: Number, required: true, min: 0, max: 100 },
  toolScore: { type: Number, required: true, min: 0, max: 100 },
  contentTypeScore: { type: Number, required: true, min: 0, max: 100 },
  formatScore: { type: Number, required: true, min: 0, max: 100 },
  commercialScore: { type: Number, required: true, min: 0, max: 100 },
  experienceScore: { type: Number, required: true, min: 0, max: 100 },
  finalScore: { type: Number, required: true, min: 0, max: 100, index: true },
  reasons: [{ type: String, required: true }],
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// Composite index for fast matching lookups per brief
MatchResultSchema.index({ briefId: 1, creatorId: 1 });

export const MatchResultModel: Model<IMatchResult> = mongoose.models.MatchResult || mongoose.model<IMatchResult>('MatchResult', MatchResultSchema);

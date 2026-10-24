import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IShortlistProposal extends Document {
  id: string;
  briefId: string;
  briefTitle: string;
  evaluatedCandidatesCount: number;
  shortlist: any[];
  excludedCandidates: {
    creatorId: string;
    creatorName: string;
    reason: string;
  }[];
  status: 'PROPOSED' | 'ACCEPTED' | 'EDITED' | 'REJECTED';
  brandDecisionNotes?: string;
  createdAt: Date;
  decidedAt?: Date;
}

const ShortlistProposalSchema = new Schema<IShortlistProposal>({
  id: { type: String, required: true, unique: true, index: true },
  briefId: { type: String, required: true, index: true },
  briefTitle: { type: String, required: true },
  evaluatedCandidatesCount: { type: Number, default: 0 },
  shortlist: [{ type: Schema.Types.Mixed }],
  excludedCandidates: [{
    creatorId: String,
    creatorName: String,
    reason: String,
  }],
  status: {
    type: String,
    enum: ['PROPOSED', 'ACCEPTED', 'EDITED', 'REJECTED'],
    default: 'PROPOSED',
    index: true,
  },
  brandDecisionNotes: String,
  decidedAt: Date,
}, {
  timestamps: true,
});

export const ShortlistProposalModel: Model<IShortlistProposal> =
  mongoose.models.ShortlistProposal || mongoose.model<IShortlistProposal>('ShortlistProposal', ShortlistProposalSchema);

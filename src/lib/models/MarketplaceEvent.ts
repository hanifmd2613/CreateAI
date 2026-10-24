import mongoose, { Schema, Document, Model } from 'mongoose';

export type MarketplaceEventType =
  | 'SEARCH_SUBMITTED'
  | 'RESULT_IMPRESSION'
  | 'CREATOR_VIEWED'
  | 'PORTFOLIO_ITEM_VIEWED'
  | 'CREATOR_SHORTLISTED'
  | 'INVITATION_SENT'
  | 'PROPOSAL_ACCEPTED'
  | 'PROPOSAL_DECLINED'
  | 'DELIVERY_ACCEPTED'
  | 'DELIVERY_REJECTED'
  | 'ENGAGEMENT_COMPLETED'
  | 'BRAND_FEEDBACK';

export interface IMarketplaceEvent extends Document {
  eventId: string;
  eventType: MarketplaceEventType;
  briefId?: string;
  creatorId?: string;
  brandId?: string;
  engagementId?: string;
  position?: number;
  rankingScore?: number;
  modelVersion?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const MarketplaceEventSchema = new Schema<IMarketplaceEvent>({
  eventId: { type: String, required: true, unique: true, index: true },
  eventType: { 
    type: String, 
    required: true, 
    enum: [
      'SEARCH_SUBMITTED',
      'RESULT_IMPRESSION',
      'CREATOR_VIEWED',
      'PORTFOLIO_ITEM_VIEWED',
      'CREATOR_SHORTLISTED',
      'INVITATION_SENT',
      'PROPOSAL_ACCEPTED',
      'PROPOSAL_DECLINED',
      'DELIVERY_ACCEPTED',
      'DELIVERY_REJECTED',
      'ENGAGEMENT_COMPLETED',
      'BRAND_FEEDBACK'
    ],
    index: true 
  },
  briefId: { type: String, index: true },
  creatorId: { type: String, index: true },
  brandId: { type: String, index: true },
  engagementId: { type: String, index: true },
  position: { type: Number },
  rankingScore: { type: Number },
  modelVersion: { type: String, default: 'baseline-6factor-v2.1' },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now, index: true }
});

MarketplaceEventSchema.index({ briefId: 1, creatorId: 1 });
MarketplaceEventSchema.index({ creatorId: 1, eventType: 1 });

export const MarketplaceEventModel: Model<IMarketplaceEvent> = 
  mongoose.models.MarketplaceEvent || 
  mongoose.model<IMarketplaceEvent>('MarketplaceEvent', MarketplaceEventSchema);

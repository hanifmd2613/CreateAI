import crypto from 'crypto';
import { connectToDatabase } from '../mongodb';
import { MarketplaceEventModel, MarketplaceEventType } from '../models/MarketplaceEvent';

export interface TrackEventParams {
  eventType: MarketplaceEventType;
  briefId?: string;
  creatorId?: string;
  brandId?: string;
  engagementId?: string;
  position?: number;
  rankingScore?: number;
  modelVersion?: string;
  metadata?: Record<string, any>;
}

// Memory buffer for offline resilience or local tests
const memoryEvents: any[] = [];

/**
 * Tracks a marketplace feedback or interaction event into durable MongoDB storage.
 */
export async function trackMarketplaceEvent(params: TrackEventParams): Promise<{
  success: boolean;
  eventId: string;
}> {
  const eventId = `evt-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const record = {
    eventId,
    eventType: params.eventType,
    briefId: params.briefId,
    creatorId: params.creatorId,
    brandId: params.brandId,
    engagementId: params.engagementId,
    position: params.position,
    rankingScore: params.rankingScore,
    modelVersion: params.modelVersion || 'gencraft-ml-hybrid-v1.0',
    metadata: params.metadata || {},
    createdAt: new Date(),
  };

  memoryEvents.push(record);
  if (memoryEvents.length > 500) memoryEvents.shift();

  try {
    const conn = await connectToDatabase();
    if (conn) {
      await MarketplaceEventModel.create(record);
    }
  } catch (err) {
    console.warn('MarketplaceEvent tracking write warning:', err);
  }

  return { success: true, eventId };
}

/**
 * Retrieves interaction telemetry for a creator to derive training features.
 */
export async function getCreatorEventStats(creatorId: string): Promise<{
  impressions: number;
  views: number;
  shortlists: number;
  invitations: number;
  acceptances: number;
  declines: number;
  deliveriesApproved: number;
  deliveriesRejected: number;
  acceptanceRate: number;
  deliveryPassRate: number;
}> {
  let events: any[] = [];
  try {
    const conn = await connectToDatabase();
    if (conn) {
      events = await MarketplaceEventModel.find({ creatorId }).lean();
    }
  } catch (e) {
    // fallback
  }

  if (events.length === 0) {
    events = memoryEvents.filter(e => e.creatorId === creatorId);
  }

  let impressions = 0;
  let views = 0;
  let shortlists = 0;
  let invitations = 0;
  let acceptances = 0;
  let declines = 0;
  let deliveriesApproved = 0;
  let deliveriesRejected = 0;

  for (const e of events) {
    if (e.eventType === 'RESULT_IMPRESSION') impressions++;
    else if (e.eventType === 'CREATOR_VIEWED') views++;
    else if (e.eventType === 'CREATOR_SHORTLISTED') shortlists++;
    else if (e.eventType === 'INVITATION_SENT') invitations++;
    else if (e.eventType === 'PROPOSAL_ACCEPTED') acceptances++;
    else if (e.eventType === 'PROPOSAL_DECLINED') declines++;
    else if (e.eventType === 'DELIVERY_ACCEPTED' || e.eventType === 'ENGAGEMENT_COMPLETED') deliveriesApproved++;
    else if (e.eventType === 'DELIVERY_REJECTED') deliveriesRejected++;
  }

  const totalDecisions = acceptances + declines;
  const acceptanceRate = totalDecisions > 0 ? acceptances / totalDecisions : 0.85;

  const totalDeliveries = deliveriesApproved + deliveriesRejected;
  const deliveryPassRate = totalDeliveries > 0 ? deliveriesApproved / totalDeliveries : 0.95;

  return {
    impressions,
    views,
    shortlists,
    invitations,
    acceptances,
    declines,
    deliveriesApproved,
    deliveriesRejected,
    acceptanceRate: Number(acceptanceRate.toFixed(2)),
    deliveryPassRate: Number(deliveryPassRate.toFixed(2)),
  };
}

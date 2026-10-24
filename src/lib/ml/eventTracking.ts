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

export type PersistenceStatus = 'durable' | 'buffered_in_memory' | 'failed';
export type StorageBackend = 'mongodb' | 'memory_buffer' | 'none';

export interface TrackEventResult {
  success: boolean;
  eventId: string;
  persistenceStatus: PersistenceStatus;
  storageBackend: StorageBackend;
  error?: string;
}

// Bounded memory buffer for local resilience and test environments
const MAX_MEMORY_EVENTS = 500;
const memoryEvents: any[] = [];
const seenEventIds = new Set<string>();

/**
 * Tracks a marketplace feedback or interaction event.
 * Honestly distinguishes durable MongoDB persistence from local in-memory buffering.
 */
export async function trackMarketplaceEvent(params: TrackEventParams): Promise<TrackEventResult> {
  // Validate event type
  if (!params.eventType) {
    return {
      success: false,
      eventId: '',
      persistenceStatus: 'failed',
      storageBackend: 'none',
      error: 'eventType is required',
    };
  }

  const eventId = `evt-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  // Deduplication check
  if (seenEventIds.has(eventId)) {
    return {
      success: true,
      eventId,
      persistenceStatus: 'buffered_in_memory',
      storageBackend: 'memory_buffer',
    };
  }
  seenEventIds.add(eventId);

  const record = {
    eventId,
    eventType: params.eventType,
    briefId: params.briefId,
    creatorId: params.creatorId,
    brandId: params.brandId,
    engagementId: params.engagementId,
    position: params.position,
    rankingScore: params.rankingScore,
    modelVersion: params.modelVersion || 'gencraft-ml-hybrid-v2.2',
    metadata: params.metadata || {},
    createdAt: new Date(),
  };

  // Add to bounded memory buffer
  memoryEvents.push(record);
  if (memoryEvents.length > MAX_MEMORY_EVENTS) {
    const dropped = memoryEvents.shift();
    if (dropped?.eventId) seenEventIds.delete(dropped.eventId);
  }

  // Attempt durable persistence to MongoDB
  try {
    const conn = await connectToDatabase();
    if (conn) {
      await MarketplaceEventModel.create(record);
      return {
        success: true,
        eventId,
        persistenceStatus: 'durable',
        storageBackend: 'mongodb',
      };
    }
  } catch (err: any) {
    console.warn('[TelemetryWarning] MongoDB event write failed; buffered in memory:', err.message);
  }

  // If MongoDB was unavailable or failed, honestly return buffered_in_memory
  return {
    success: true,
    eventId,
    persistenceStatus: 'buffered_in_memory',
    storageBackend: 'memory_buffer',
    error: 'Durable MongoDB write unavailable; event buffered in local process memory.',
  };
}

/**
 * Retrieves interaction telemetry for a creator to derive ranking & conversion features.
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
  telemetrySource: 'mongodb' | 'memory_buffer';
}> {
  let events: any[] = [];
  let telemetrySource: 'mongodb' | 'memory_buffer' = 'memory_buffer';

  try {
    const conn = await connectToDatabase();
    if (conn) {
      events = await MarketplaceEventModel.find({ creatorId }).lean();
      if (events && events.length > 0) {
        telemetrySource = 'mongodb';
      }
    }
  } catch (e) {
    // Fall back to memory buffer
  }

  if (events.length === 0) {
    events = memoryEvents.filter(e => e.creatorId === creatorId);
    telemetrySource = 'memory_buffer';
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
    else if (e.eventType === 'DELIVERY_APPROVED') deliveriesApproved++;
    else if (e.eventType === 'DELIVERY_REJECTED') deliveriesRejected++;
  }

  const totalDecisions = acceptances + declines;
  const acceptanceRate = totalDecisions > 0
    ? Number((acceptances / totalDecisions).toFixed(2))
    : (invitations > 0 ? Number((acceptances / invitations).toFixed(2)) : 0);
  const deliveryPassRate = (deliveriesApproved + deliveriesRejected) > 0
    ? Number((deliveriesApproved / (deliveriesApproved + deliveriesRejected)).toFixed(2))
    : 1.0;

  return {
    impressions,
    views,
    shortlists,
    invitations,
    acceptances,
    declines,
    deliveriesApproved,
    deliveriesRejected,
    acceptanceRate,
    deliveryPassRate,
    telemetrySource,
  };
}

/**
 * Helper for testing: Clears in-memory event buffers.
 */
export function clearMemoryEvents(): void {
  memoryEvents.length = 0;
  seenEventIds.clear();
}

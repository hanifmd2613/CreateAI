import { connectToDatabase } from './mongodb';
import { EngagementModel } from './models/Engagement';
import { DeliverableVersionModel } from './models/DeliverableVersion';
import { VersionFeedbackModel } from './models/VersionFeedback';
import { DeliveryCheckModel } from './models/DeliveryCheck';
import { AuditLogModel } from './models/AuditLog';
import { ShortlistProposalModel } from './models/ShortlistProposal';
import {
  EngagementRecord,
  DeliverableVersion,
  VersionFeedback,
  DeliveryCheckResult,
  AuditLogEntry,
  AutoShortlistProposal
} from '../types';

// In-memory fallback caches for sandbox resilience
const engagementsMemory: Map<string, EngagementRecord> = new Map();
const versionsMemory: Map<string, DeliverableVersion> = new Map();
const feedbackMemory: Map<string, VersionFeedback> = new Map();
const deliveryChecksMemory: Map<string, DeliveryCheckResult> = new Map();
const auditLogsMemory: AuditLogEntry[] = [];
const shortlistProposalsMemory: Map<string, AutoShortlistProposal> = new Map();

// Initialize realistic demo engagement:
const SEED_ENGAGEMENT_ID = 'eng-demo-kaveri-novaphone';
const demoEngagement: EngagementRecord = {
  id: SEED_ENGAGEMENT_ID,
  briefId: 'brief-novaphone-demo',
  brandId: 'user-brand-kaveri',
  brandName: 'Kaveri Creative Studios',
  brandAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=KaveriStudios',
  creatorId: 'creator-1',
  creatorName: 'Karthik Subramanian',
  creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KarthikSubramanian&gender=male&hairColor=000000&facialHairProbability=60&accessoriesProbability=20',
  projectTitle: 'NovaPhone 15s Vertical Launch Film (Holographic Series)',
  proposedBudget: '₹6,50,000',
  status: 'FINAL_REVIEW',
  licensingStatus: 'COMPATIBLE',
  message: 'Direct project commission for 15s 9:16 vertical master cut for global launch.',
  milestones: [
    { title: 'Draft V1 Generation & Seed Checkpoints', amount: '₹3,25,000', status: 'In Escrow' },
    { title: 'Final 4K Master & IP Buyout Delivery', amount: '₹3,25,000', status: 'Pending' }
  ],
  agreedTerms: {
    confirmedBudget: '₹6,50,000',
    confirmedDeadline: '3 Days',
    maxRevisionRounds: 2,
    licensingTerms: {
      commercialScope: 'Full Buyout',
      territory: 'Worldwide',
      durationMonths: 12,
      channels: ['Paid Advertising', 'Organic Social', 'Digital / Web'],
      exclusivity: 'Category Exclusive',
      derivativeRights: true,
    },
    scopeSummary: '15-second vertical 9:16 master cut with full worldwide commercial buyout rights.'
  },
  currentVersionNumber: 2,
  maxRevisions: 2,
  revisionsUsed: 1,
  createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
  updatedAt: new Date().toISOString(),
};
engagementsMemory.set(SEED_ENGAGEMENT_ID, demoEngagement);

// Version 1
const v1Id = `ver-${SEED_ENGAGEMENT_ID}-v1`;
const v1Version: DeliverableVersion = {
  id: v1Id,
  engagementId: SEED_ENGAGEMENT_ID,
  versionNumber: 1,
  fileUrl: 'https://storage.gencraft.ai/engagements/novaphone_v1_30s_rough.mp4',
  fileName: 'novaphone_launch_v1_30s_rough.mp4',
  fileSize: 28400000,
  fileChecksum: 'a71b3e9481284e892c908df389281a8c9837f19b28374e',
  uploaderId: 'creator-1',
  uploaderName: 'Karthik Subramanian',
  submittedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
  generationNotes: 'Generated initial rough cut in Flux.1 + Veo. Extended drift sequence for brand review.',
  status: 'REVISION_REQUESTED',
};
versionsMemory.set(v1Id, v1Version);

// Version 1 Check Result (FAIL on duration)
const v1Check: DeliveryCheckResult = {
  id: `chk-${SEED_ENGAGEMENT_ID}-v1`,
  versionId: v1Id,
  engagementId: SEED_ENGAGEMENT_ID,
  overallStatus: 'FAIL',
  checks: [
    {
      id: 'chk-decodable',
      name: 'Media Decodability & Container Integrity',
      requirement: 'Valid, uncorrupted MP4 media stream',
      actual: 'MP4 (Container: isom)',
      status: 'PASS',
      message: 'Media header is clean, intact, and decodable.',
      isBlocking: false,
    },
    {
      id: 'chk-ratio',
      name: 'Aspect Ratio & Orientation',
      requirement: 'Strict 9:16',
      actual: '9:16 (1080×1920px)',
      status: 'PASS',
      message: 'Aspect ratio matches target 9:16 specification.',
      isBlocking: true,
    },
    {
      id: 'chk-duration',
      name: 'Video Duration Constraint',
      requirement: 'Maximum 15s runtime',
      actual: '30s runtime',
      status: 'FAIL',
      message: 'Asset duration (30s) exceeds the required maximum limit of 15s by 15.0s.',
      isBlocking: true,
    }
  ],
  extractedMetadata: {
    format: 'mp4',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    durationSeconds: 30,
    fileSizeBytes: 28400000,
    isDecodable: true,
  },
  inspectedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
  actionableGuidance: 'Fix the duration violation: re-edit and trim to 15 seconds maximum.'
};
deliveryChecksMemory.set(v1Check.id, v1Check);
v1Version.latestCheckResult = v1Check;

// Version Feedback on V1
const fb1: VersionFeedback = {
  id: `fb-${SEED_ENGAGEMENT_ID}-1`,
  engagementId: SEED_ENGAGEMENT_ID,
  versionId: v1Id,
  authorId: 'user-brand-kaveri',
  authorName: 'Kaveri Creative Studios',
  authorRole: 'brand',
  timestampOffset: 12.0,
  comment: 'Visual aesthetics and drift physics are stunning, but runtime is 30s. Please trim to exactly 15s for Instagram Reels & Shorts.',
  resolved: true,
  resolvedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
  resolvedInVersion: 2,
  createdAt: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
};
feedbackMemory.set(fb1.id, fb1);

// Version 2
const v2Id = `ver-${SEED_ENGAGEMENT_ID}-v2`;
const v2Check: DeliveryCheckResult = {
  id: `chk-${SEED_ENGAGEMENT_ID}-v2`,
  versionId: v2Id,
  engagementId: SEED_ENGAGEMENT_ID,
  overallStatus: 'PASS',
  checks: [
    {
      id: 'chk-decodable',
      name: 'Media Decodability & Container Integrity',
      requirement: 'Valid, uncorrupted MP4 media stream',
      actual: 'MP4 (Container: isom)',
      status: 'PASS',
      message: 'Media header is clean, intact, and decodable.',
      isBlocking: false,
    },
    {
      id: 'chk-ratio',
      name: 'Aspect Ratio & Orientation',
      requirement: 'Strict 9:16',
      actual: '9:16 (1080×1920px)',
      status: 'PASS',
      message: 'Aspect ratio matches target 9:16 specification.',
      isBlocking: true,
    },
    {
      id: 'chk-duration',
      name: 'Video Duration Constraint',
      requirement: 'Maximum 15s runtime',
      actual: '15.0s runtime',
      status: 'PASS',
      message: 'Duration (15.0s) is strictly within the 15s threshold.',
      isBlocking: true,
    }
  ],
  extractedMetadata: {
    format: 'mp4',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    durationSeconds: 15,
    fileSizeBytes: 14200000,
    isDecodable: true,
  },
  inspectedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
  actionableGuidance: 'All automated physical delivery checks passed. Deliverable is ready for Brand Creative Director sign-off.'
};
deliveryChecksMemory.set(v2Check.id, v2Check);

const v2Version: DeliverableVersion = {
  id: v2Id,
  engagementId: SEED_ENGAGEMENT_ID,
  versionNumber: 2,
  fileUrl: 'https://storage.gencraft.ai/engagements/novaphone_v2_15s_master.mp4',
  fileName: 'novaphone_launch_v2_15s_master.mp4',
  fileSize: 14200000,
  fileChecksum: 'f3910b847192847c928374981729384729182374912',
  uploaderId: 'creator-1',
  uploaderName: 'Karthik Subramanian',
  submittedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
  generationNotes: 'Tightened pacing in Kling to 15.0s flat; accelerated holographic reveal and enhanced neon reflections.',
  status: 'UNDER_REVIEW',
  latestCheckResult: v2Check,
};
versionsMemory.set(v2Id, v2Version);

auditLogsMemory.push({
  id: `audit-${SEED_ENGAGEMENT_ID}-init`,
  engagementId: SEED_ENGAGEMENT_ID,
  briefId: 'brief-novaphone-demo',
  action: 'ENGAGEMENT_INITIALIZED',
  actorId: 'user-brand-kaveri',
  actorName: 'Kaveri Creative Studios',
  actorRole: 'brand',
  timestamp: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
  details: {
    projectTitle: 'NovaPhone 15s Vertical Launch Film (Holographic Series)',
    budget: '₹6,50,000',
    creatorId: 'creator-1',
  },
});


// ============================================================================
// ENGAGEMENT OPERATIONS
// ============================================================================

export async function getEngagements(filter: { creatorId?: string; brandId?: string } = {}): Promise<EngagementRecord[]> {
  const conn = await connectToDatabase();
  if (conn) {
    try {
      const query: any = {};
      if (filter.creatorId) query.creatorId = filter.creatorId;
      if (filter.brandId) query.brandId = filter.brandId;
      const docs = await EngagementModel.find(query).sort({ createdAt: -1 }).lean();
      if (docs && docs.length > 0) {
        return docs.map((d: any) => ({
          ...d,
          createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : new Date().toISOString(),
        }));
      }
    } catch (e) {
      console.warn('MongoDB getEngagements warning:', e);
    }
  }

  let list = Array.from(engagementsMemory.values());
  if (filter.creatorId) list = list.filter(e => e.creatorId === filter.creatorId);
  if (filter.brandId) list = list.filter(e => e.brandId === filter.brandId);
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getEngagementById(id: string): Promise<EngagementRecord | null> {
  const conn = await connectToDatabase();
  if (conn) {
    try {
      const doc = await EngagementModel.findOne({ id }).lean();
      if (doc) {
        return {
          ...doc,
          createdAt: (doc as any).createdAt ? new Date((doc as any).createdAt).toISOString() : new Date().toISOString(),
          updatedAt: (doc as any).updatedAt ? new Date((doc as any).updatedAt).toISOString() : new Date().toISOString(),
        } as EngagementRecord;
      }
    } catch (e) {
      console.warn('MongoDB getEngagementById warning:', e);
    }
  }

  return engagementsMemory.get(id) || null;
}

export async function saveEngagement(engagement: EngagementRecord): Promise<EngagementRecord> {
  engagementsMemory.set(engagement.id, engagement);

  const conn = await connectToDatabase();
  if (conn) {
    try {
      await EngagementModel.findOneAndUpdate(
        { id: engagement.id },
        { ...engagement, createdAt: new Date(engagement.createdAt), updatedAt: new Date(engagement.updatedAt) },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.warn('MongoDB saveEngagement warning:', e);
    }
  }

  return engagement;
}

export async function updateEngagement(id: string, updates: Partial<EngagementRecord>): Promise<EngagementRecord | null> {
  const existing = await getEngagementById(id);
  if (!existing) return null;

  const merged: EngagementRecord = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return await saveEngagement(merged);
}

// ============================================================================
// DRAFT VERSION OPERATIONS
// ============================================================================

export async function getVersions(engagementId: string): Promise<DeliverableVersion[]> {
  const conn = await connectToDatabase();
  if (conn) {
    try {
      const docs = await DeliverableVersionModel.find({ engagementId }).sort({ versionNumber: -1 }).lean();
      if (docs && docs.length > 0) {
        return docs.map((d: any) => ({
          ...d,
          submittedAt: d.submittedAt ? new Date(d.submittedAt).toISOString() : new Date().toISOString(),
        }));
      }
    } catch (e) {
      console.warn('MongoDB getVersions warning:', e);
    }
  }

  return Array.from(versionsMemory.values())
    .filter(v => v.engagementId === engagementId)
    .sort((a, b) => b.versionNumber - a.versionNumber);
}

export async function saveVersion(version: DeliverableVersion): Promise<DeliverableVersion> {
  versionsMemory.set(version.id, version);

  const conn = await connectToDatabase();
  if (conn) {
    try {
      await DeliverableVersionModel.findOneAndUpdate(
        { id: version.id },
        { ...version, submittedAt: new Date(version.submittedAt) },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.warn('MongoDB saveVersion warning:', e);
    }
  }

  return version;
}

// ============================================================================
// VERSION-SPECIFIC FEEDBACK OPERATIONS
// ============================================================================

export async function getFeedback(engagementId: string, versionId?: string): Promise<VersionFeedback[]> {
  const conn = await connectToDatabase();
  if (conn) {
    try {
      const query: any = { engagementId };
      if (versionId) query.versionId = versionId;
      const docs = await VersionFeedbackModel.find(query).sort({ createdAt: -1 }).lean();
      if (docs && docs.length > 0) {
        return docs.map((d: any) => ({
          ...d,
          createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
          resolvedAt: d.resolvedAt ? new Date(d.resolvedAt).toISOString() : undefined,
        }));
      }
    } catch (e) {
      console.warn('MongoDB getFeedback warning:', e);
    }
  }

  let list = Array.from(feedbackMemory.values()).filter(f => f.engagementId === engagementId);
  if (versionId) list = list.filter(f => f.versionId === versionId);
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function saveFeedback(item: VersionFeedback): Promise<VersionFeedback> {
  feedbackMemory.set(item.id, item);

  const conn = await connectToDatabase();
  if (conn) {
    try {
      await VersionFeedbackModel.findOneAndUpdate(
        { id: item.id },
        { 
          ...item, 
          createdAt: new Date(item.createdAt),
          resolvedAt: item.resolvedAt ? new Date(item.resolvedAt) : undefined 
        },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.warn('MongoDB saveFeedback warning:', e);
    }
  }

  return item;
}

export async function resolveFeedback(feedbackId: string, resolvedInVersion?: number): Promise<VersionFeedback | null> {
  const existing = feedbackMemory.get(feedbackId);
  const updated: VersionFeedback = existing ? {
    ...existing,
    resolved: true,
    resolvedAt: new Date().toISOString(),
    resolvedInVersion,
  } : {
    id: feedbackId,
    engagementId: '',
    versionId: '',
    authorId: '',
    authorName: '',
    authorRole: 'brand',
    comment: '',
    resolved: true,
    resolvedAt: new Date().toISOString(),
    resolvedInVersion,
    createdAt: new Date().toISOString(),
  };

  return await saveFeedback(updated);
}

// ============================================================================
// DELIVERY CHECK RESULTS OPERATIONS
// ============================================================================

export async function getDeliveryChecks(engagementId: string, versionId?: string): Promise<DeliveryCheckResult[]> {
  const conn = await connectToDatabase();
  if (conn) {
    try {
      const query: any = { engagementId };
      if (versionId) query.versionId = versionId;
      const docs = await DeliveryCheckModel.find(query).sort({ inspectedAt: -1 }).lean();
      if (docs && docs.length > 0) {
        return docs.map((d: any) => ({
          ...d,
          inspectedAt: d.inspectedAt ? new Date(d.inspectedAt).toISOString() : new Date().toISOString(),
        }));
      }
    } catch (e) {
      console.warn('MongoDB getDeliveryChecks warning:', e);
    }
  }

  let list = Array.from(deliveryChecksMemory.values()).filter(c => c.engagementId === engagementId);
  if (versionId) list = list.filter(c => c.versionId === versionId);
  return list.sort((a, b) => new Date(b.inspectedAt).getTime() - new Date(a.inspectedAt).getTime());
}

export async function saveDeliveryCheck(check: DeliveryCheckResult): Promise<DeliveryCheckResult> {
  deliveryChecksMemory.set(check.id, check);

  const conn = await connectToDatabase();
  if (conn) {
    try {
      await DeliveryCheckModel.findOneAndUpdate(
        { id: check.id },
        { ...check, inspectedAt: new Date(check.inspectedAt) },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.warn('MongoDB saveDeliveryCheck warning:', e);
    }
  }

  return check;
}

// ============================================================================
// AUDIT LOG OPERATIONS
// ============================================================================

export async function getAuditLogs(engagementId?: string, briefId?: string): Promise<AuditLogEntry[]> {
  const conn = await connectToDatabase();
  if (conn) {
    try {
      const query: any = {};
      if (engagementId) query.engagementId = engagementId;
      if (briefId) query.briefId = briefId;
      const docs = await AuditLogModel.find(query).sort({ createdAt: -1 }).lean();
      if (docs && docs.length > 0) {
        return docs.map((d: any) => ({
          ...d,
          timestamp: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
        }));
      }
    } catch (e) {
      console.warn('MongoDB getAuditLogs warning:', e);
    }
  }

  let list = [...auditLogsMemory];
  if (engagementId) list = list.filter(l => l.engagementId === engagementId);
  if (briefId) list = list.filter(l => l.briefId === briefId);
  return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function recordAudit(
  action: string,
  actorId: string,
  actorName: string,
  actorRole: 'brand' | 'creator' | 'system' | 'agent',
  details: Record<string, any>,
  engagementId?: string,
  briefId?: string
): Promise<AuditLogEntry> {
  const entry: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    engagementId,
    briefId,
    action,
    actorId,
    actorName,
    actorRole,
    timestamp: new Date().toISOString(),
    details,
  };

  auditLogsMemory.unshift(entry);

  const conn = await connectToDatabase();
  if (conn) {
    try {
      await AuditLogModel.create({
        ...entry,
        createdAt: new Date(entry.timestamp),
      });
    } catch (e) {
      console.warn('MongoDB recordAudit warning:', e);
    }
  }

  return entry;
}

// ============================================================================
// AUTO-SHORTLIST PROPOSAL OPERATIONS
// ============================================================================

export async function getShortlistProposals(briefId?: string): Promise<AutoShortlistProposal[]> {
  const conn = await connectToDatabase();
  if (conn) {
    try {
      const query: any = {};
      if (briefId) query.briefId = briefId;
      const docs = await ShortlistProposalModel.find(query).sort({ createdAt: -1 }).lean();
      if (docs && docs.length > 0) {
        return docs.map((d: any) => ({
          ...d,
          createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
          decidedAt: d.decidedAt ? new Date(d.decidedAt).toISOString() : undefined,
        }));
      }
    } catch (e) {
      console.warn('MongoDB getShortlistProposals warning:', e);
    }
  }

  let list = Array.from(shortlistProposalsMemory.values());
  if (briefId) list = list.filter(p => p.briefId === briefId);
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function saveShortlistProposal(proposal: AutoShortlistProposal): Promise<AutoShortlistProposal> {
  shortlistProposalsMemory.set(proposal.id, proposal);

  const conn = await connectToDatabase();
  if (conn) {
    try {
      await ShortlistProposalModel.findOneAndUpdate(
        { id: proposal.id },
        { 
          ...proposal, 
          createdAt: new Date(proposal.createdAt),
          decidedAt: proposal.decidedAt ? new Date(proposal.decidedAt) : undefined 
        },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.warn('MongoDB saveShortlistProposal warning:', e);
    }
  }

  return proposal;
}

// Aliases for unified test and consumer interfaces
export const getAllEngagements = getEngagements;
export const addDeliverableVersion = saveVersion;
export const getDeliverableVersions = getVersions;
export const addVersionFeedback = saveFeedback;
export const getVersionFeedback = (versionId: string) => {
  return Array.from(feedbackMemory.values()).filter(f => f.versionId === versionId);
};
export const saveDeliveryCheckResult = saveDeliveryCheck;
export const getDeliveryCheckResult = (id: string) => {
  return deliveryChecksMemory.get(id) || null;
};
export const addAuditLog = recordAudit;



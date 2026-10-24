export interface WorkflowStep {
  step: number;
  phase: string;
  tool: string;
  description: string;
  settings?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  type: 'video' | 'image' | 'audio';
  mediaUrl: string;
  thumbnail: string;
  specificModel?: string;
  model?: string;
  tools?: string[];
  workflowDescription?: string;
  workflow?: string;
  contentType?: string;
  style?: string;
  aspectRatio: string;
  duration?: string;
  client?: string;
  promptSnippet?: string;
  commercialUse?: string;
  verificationStatus?: 'Verified' | 'Pending' | 'Self-Reported';
  steps?: WorkflowStep[];
  views?: string;
  likes?: number;
}

export interface CreatorReview {
  id: string;
  brandName: string;
  brandLogo: string;
  rating: number;
  date: string;
  comment: string;
  projectTitle: string;
}

export interface VerificationSignals {
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

export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  coverImage?: string;
  specialization: string;
  bio: string;
  location: string;
  skills: string[];
  tools: string[];
  models?: string[];
  contentTypes?: string[];
  styles?: string[];
  experience?: string;
  hourlyRate: number;
  projectRate?: number;
  availability?: boolean;
  isVerified: boolean;
  verification?: VerificationSignals;
  verifiedDetails?: VerificationSignals;
  rating: number;
  reviewCount: number;
  completedProjects: number;
  commercialUse?: string;
  avgTurnaround: string;
  availableNow: boolean;
  portfolio: PortfolioItem[];
  reviews?: CreatorReview[];
  isUserCreated?: boolean;
  gender?: 'male' | 'female';
  licensingTerms?: CreatorLicensingTerms;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
  isCreatorReply?: boolean;
}

export interface Brief {
  id: string;
  title: string;
  brandName: string;
  brandAvatar?: string;
  rawIdea?: string;
  contentType: string;
  style: string;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  duration?: string;
  platforms?: string[];
  commercialUse: 'Full Buyout' | 'Licensed';
  budget: string;
  deadline: string;
  description: string;
  requiredSkills?: string[];
  requiredTools: string[];
  deliverables?: string[];
  status?: 'Open' | 'In Review' | 'In Production';
  createdAt?: string;
  applicantsCount?: number;
  licensingRequirements?: LicensingRequirements;
  targetSpecs?: MediaDeliverySpecs;
}

export type UserRole = 'brand' | 'creator';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  handle: string;
  companyName?: string;
  specialization?: string;
  bio?: string;
  tools?: string[];
  skills?: string[];
  hourlyRate?: number;
  location?: string;
  isVerified?: boolean;
  gender?: 'male' | 'female';
  groqApiKey?: string;
  geminiApiKey?: string;
}

export type PageView = 'discovery' | 'profile' | 'brief-builder' | 'briefs-feed' | 'creator-studio' | 'workspace';

// ============================================================================
// ROUND 2: LICENSING & COMMERCIAL USE SPECIFICATIONS
// ============================================================================

export type LicensingStatus = 'COMPATIBLE' | 'MISMATCH' | 'UNKNOWN' | 'NEEDS_REVIEW';

export interface LicensingRequirements {
  commercialScope: 'Full Buyout' | 'Commercial Licensed' | 'Editorial Only';
  territory: 'Worldwide' | 'Domestic (India)' | 'Regional (APAC)' | 'North America' | 'Europe';
  durationMonths: number; // e.g. 12
  channels: ('Organic Social' | 'Paid Advertising' | 'Digital / Web' | 'Broadcast / TV' | 'Out-of-Home (OOH)' | 'All Media')[];
  exclusivity: 'Non-Exclusive' | 'Category Exclusive' | 'Total Exclusive';
  derivativeRights: boolean;
  aiModelRestrictions?: string[];
  attributionRequired?: boolean;
}

export interface CreatorLicensingTerms {
  permittedScope: 'Full Buyout' | 'Commercial Licensed' | 'Editorial Only';
  allowedTerritories: ('Worldwide' | 'Domestic (India)' | 'Regional (APAC)' | 'North America' | 'Europe')[];
  maxDurationMonths: number;
  allowedChannels: ('Organic Social' | 'Paid Advertising' | 'Digital / Web' | 'Broadcast / TV' | 'Out-of-Home (OOH)' | 'All Media')[];
  exclusivityAvailable: boolean;
  derivativeRightsAllowed: boolean;
  modelAuditCertifications?: string[];
  attributionRequired?: boolean;
  customRestrictions?: string[];
}

export interface LicensingConflictDetail {
  parameter: string;
  requested: any;
  permitted: any;
  compatible: boolean;
  explanation: string;
}

export interface LicensingEvaluationResult {
  status: LicensingStatus;
  compatible: boolean;
  conflicts: string[];
  details: LicensingConflictDetail[];
  summary: string;
  humanReviewRequired: boolean;
  actionRequired?: string;
}

// ============================================================================
// ROUND 2: TECHNICAL DELIVERY SPECIFICATIONS
// ============================================================================

export interface MediaDeliverySpecs {
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  width?: number; // e.g. 1080
  height?: number; // e.g. 1920
  maxDurationSeconds?: number; // e.g. 15
  minDurationSeconds?: number;
  requiredFormat?: 'mp4' | 'png' | 'jpg' | 'webp' | 'mov';
  maxFileSizeBytes?: number; // e.g. 100 * 1024 * 1024 (100MB)
  frameRate?: number; // e.g. 60
}

export type DeliveryCheckStatus = 'PASS' | 'FAIL' | 'WARNING' | 'UNVERIFIABLE';

export interface SingleDeliveryCheck {
  id: string;
  name: string;
  requirement: string;
  actual: string;
  status: DeliveryCheckStatus;
  message: string;
  isBlocking: boolean;
}

export interface DeliveryCheckResult {
  id: string;
  versionId: string;
  engagementId: string;
  overallStatus: DeliveryCheckStatus;
  checks: SingleDeliveryCheck[];
  extractedMetadata: {
    format?: string;
    width?: number;
    height?: number;
    aspectRatio?: string;
    durationSeconds?: number;
    fileSizeBytes?: number;
    isDecodable?: boolean;
    checksumSha256?: string;
  };
  inspectedAt: string;
  actionableGuidance?: string;
}

// ============================================================================
// ROUND 2: ENGAGEMENT 19-STAGE FINITE STATE MACHINE
// ============================================================================

export type EngagementStatus =
  | 'DISCOVERY'
  | 'SHORTLISTED'
  | 'CONTACT_PENDING'
  | 'CONTACTED'
  | 'CREATOR_RESPONDED'
  | 'CREATOR_ACCEPTED'
  | 'CREATOR_DECLINED'
  | 'SCOPE_CONFIRMATION'
  | 'LICENSING_REVIEW'
  | 'AGREEMENT_CONFIRMED'
  | 'IN_PRODUCTION'
  | 'DRAFT_SUBMITTED'
  | 'REVISION_REQUESTED'
  | 'REVISION_IN_PROGRESS'
  | 'FINAL_REVIEW'
  | 'DELIVERY_APPROVED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ON_HOLD';

export interface AgreedEngagementTerms {
  confirmedBudget: string;
  confirmedDeadline: string;
  maxRevisionRounds: number;
  licensingTerms: LicensingRequirements;
  scopeSummary: string;
  confirmedByBrandAt?: string;
  confirmedByCreatorAt?: string;
}

export interface EngagementMilestone {
  title: string;
  amount: string;
  status: 'Pending' | 'In Escrow' | 'Released';
}

export interface EngagementRecord {
  id: string;
  briefId?: string;
  brandId: string;
  brandName: string;
  brandAvatar?: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  projectTitle: string;
  proposedBudget: string;
  status: EngagementStatus;
  licensingStatus: LicensingStatus;
  message?: string;
  milestones?: EngagementMilestone[];
  agreedTerms?: AgreedEngagementTerms;
  currentVersionNumber: number;
  maxRevisions: number;
  revisionsUsed: number;
  declineReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ROUND 2: IMMUTABLE DRAFT VERSIONING & FEEDBACK
// ============================================================================

export type VersionReviewStatus = 'DRAFT' | 'UNDER_REVIEW' | 'REVISION_REQUESTED' | 'APPROVED' | 'SUPERSEDED';

export interface DeliverableVersion {
  id: string;
  engagementId: string;
  versionNumber: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileChecksum: string;
  uploaderId: string;
  uploaderName: string;
  submittedAt: string;
  generationNotes: string;
  status: VersionReviewStatus;
  latestCheckResult?: DeliveryCheckResult;
}

export interface VersionFeedback {
  id: string;
  engagementId: string;
  versionId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  timestampOffset?: number; // Video second offset
  coordinates?: { x: number; y: number }; // Region note on image
  comment: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedInVersion?: number;
  createdAt: string;
}

// ============================================================================
// ROUND 2: AUTO-SHORTLIST AGENT & AUDIT LOGS
// ============================================================================

export interface ShortlistCandidate {
  creatorId: string;
  creator: Creator;
  matchScore: number;
  licensingStatus: LicensingStatus;
  positiveEvidence: string[];
  missingFactors: string[];
  recommendedNextAction: string;
}

export interface ExcludedCandidate {
  creatorId: string;
  creatorName: string;
  reason: string;
}

export interface AutoShortlistProposal {
  id: string;
  briefId: string;
  briefTitle: string;
  evaluatedCandidatesCount: number;
  shortlist: ShortlistCandidate[];
  excludedCandidates: ExcludedCandidate[];
  status: 'PROPOSED' | 'ACCEPTED' | 'EDITED' | 'REJECTED';
  brandDecisionNotes?: string;
  createdAt: string;
  decidedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  engagementId?: string;
  briefId?: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole | 'system' | 'agent';
  timestamp: string;
  details: Record<string, any>;
}



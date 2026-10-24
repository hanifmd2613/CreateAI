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
  specificModel: string;
  workflowDescription: string;
  aspectRatio: string;
  duration?: string;
  client?: string;
  promptSnippet?: string;
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

// Stated Usage Rights offered by a creator
export interface CreatorUsageRightsTerms {
  commercialUseAllowed: boolean;
  licensingType: 'Full Buyout' | 'Licensed Commercial' | 'Non-Commercial';
  defaultDurationMonths: number;
  territory: 'India Only' | 'South Asia' | 'Worldwide';
  supportedPlatforms: string[];
  paidAdvertisingAllowed: boolean;
  exclusivityOffered: boolean;
  modificationRightsAllowed: boolean;
  thirdPartyAssetClearance: boolean;
  aiDisclosureCompliance: boolean;
  creatorRestrictions?: string;
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
  isVerified: boolean;
  verifiedDetails?: {
    certifiedPipeline: string;
    auditDate: string;
    safetyScore: number;
    commercialRightsGuaranteed: boolean;
  };
  rating: number;
  reviewCount: number;
  completedProjects: number;
  hourlyRate: number;
  minProjectFeeINR?: number;
  avgTurnaround: string;
  availableNow: boolean;
  supportedPlatforms: string[];
  portfolio: PortfolioItem[];
  reviews?: CreatorReview[];
  usageTerms: CreatorUsageRightsTerms;
  isUserCreated?: boolean;
  gender?: 'male' | 'female';
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

// Campaign Required Usage Rights
export interface CampaignUsageRightsRequirement {
  purpose: 'Commercial Brand Campaign' | 'Organic UGC' | 'Corporate' | 'Editorial';
  commercialUse: 'Full Buyout' | 'Licensed Commercial' | 'Non-Commercial';
  durationMonths: number;
  territory: 'India Only' | 'South Asia' | 'Worldwide';
  platforms: string[];
  paidAdvertisingRequired: boolean;
  exclusivityRequired: boolean;
  modificationRightsRequired: boolean;
  aiDisclosureRequired: boolean;
  customTerms?: string;
  confirmedByBrand?: boolean;
  confirmedAt?: string;
}

// Campaign Technical Deliverable Specifications
export interface DeliverableSpec {
  id: string;
  title: string;
  format: 'MP4' | 'MOV' | 'JPG' | 'PNG';
  aspectRatio: '9:16' | '16:9' | '1:1' | '4:5';
  width: number;
  height: number;
  targetDurationSeconds?: number;
  durationToleranceSeconds?: number;
  maxFileSizeBytes: number;
  requiredVariantsCount: number;
  isStrict: boolean;
}

// 18 Lifecycle Stages
export type CampaignLifecycleStage = 
  | 'draft'
  | 'published'
  | 'matching'
  | 'shortlisted'
  | 'contacted'
  | 'responses_received'
  | 'selected'
  | 'terms_negotiation'
  | 'rights_confirmed'
  | 'in_production'
  | 'draft_submitted'
  | 'brand_review'
  | 'revision_requested'
  | 'final_submitted'
  | 'tech_validation'
  | 'approved_completed'
  | 'cancelled';

export interface Brief {
  id: string;
  title: string;
  brandName: string;
  brandAvatar?: string;
  campaignObjective: string;
  productOrService: string;
  targetAudience: string;
  industryNiche: string;
  contentType: string;
  style: string;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  commercialUse: 'Full Buyout' | 'Licensed';
  budget: string;
  budgetMinINR?: number;
  budgetMaxINR?: number;
  deadline: string;
  description: string;
  requiredTools: string[];
  requiredSkills: string[];
  targetPlatforms: string[];
  requiredCreatorsCount: number;
  deliverables?: string[];
  deliverableSpecs: DeliverableSpec[];
  usageRights: CampaignUsageRightsRequirement;
  mandatoryCriteria: string[];
  preferredAttributes: string[];
  lifecycleStage: CampaignLifecycleStage;
  status?: 'Open' | 'In Review' | 'In Production' | 'Completed';
  createdAt?: string;
  applicantsCount?: number;
  shortlistCreatorIds: string[];
  selectedCreatorIds: string[];
  notes?: string;
}

// Matching and Recommendation Result
export type RightsCompatibilityStatus = 'compatible' | 'conflict' | 'unknown';

export interface MatchScoreBreakdown {
  creativeFit: number;        // 30%
  portfolioEvidence: number;  // 25%
  skillsTools: number;        // 20%
  budgetDeadline: number;     // 15%
  trustVerification: number;  // 10%
}

export interface MatchResult {
  creatorId: string;
  creator: Creator;
  matchScore: number; // 0 - 100
  scoreBreakdown: MatchScoreBreakdown;
  isEligible: boolean;
  hardConstraintViolations: string[];
  rightsCompatibility: RightsCompatibilityStatus;
  rightsDiagnostic: string;
  reasonsForRank: string[];
  potentialConcerns: string[];
  missingInformation: string[];
  suggestedQuestions: string[];
}

export interface AutoShortlistReport {
  generatedAt: string;
  campaignId: string;
  requestedCount: number;
  selectedCreators: {
    creatorId: string;
    creatorName: string;
    score: number;
    selectionRationale: string;
  }[];
  excludedCreators: {
    creatorId: string;
    creatorName: string;
    reason: string;
  }[];
  unresolvedItems: string[];
  status: 'pending_approval' | 'approved' | 'rejected';
}

// Version-based Deliverable and Quality Validation
export interface VersionComment {
  id: string;
  authorName: string;
  authorRole: UserRole;
  timestamp: string;
  text: string;
  timecodeSeconds?: number;
  isRevisionRequest?: boolean;
}

export interface ValidationCheck {
  id: string;
  name: string;
  category: 'format' | 'aspect_ratio' | 'dimensions' | 'duration' | 'file_size';
  expected: string;
  actual: string;
  passed: boolean;
  severity: 'strict' | 'warning';
  message: string;
  correctiveAction?: string;
}

export interface ValidationRunResult {
  id: string;
  testedAt: string;
  overallStatus: 'pass' | 'fail' | 'needs_review';
  checks: ValidationCheck[];
  summary: string;
}

export interface DeliverableVersion {
  versionNumber: number;
  fileUrl: string;
  fileName: string;
  fileSizeBytes: number;
  fileType: string;
  dimensions?: { width: number; height: number };
  durationSeconds?: number;
  aspectRatioDetected?: string;
  submittedAt: string;
  submittedBy: string;
  changelog?: string;
  comments: VersionComment[];
  validationRun?: ValidationRunResult;
}

export type DeliverableStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'changes_requested'
  | 'resubmitted'
  | 'approved'
  | 'rejected';

export interface CampaignDeliverable {
  id: string;
  campaignId: string;
  creatorId: string;
  specId: string;
  title: string;
  status: DeliverableStatus;
  currentVersionNumber: number;
  versions: DeliverableVersion[];
}

// Creator Engagement Status
export type EngagementStatus = 
  | 'invited'
  | 'accepted'
  | 'declined'
  | 'negotiating'
  | 'selected'
  | 'rights_confirmed'
  | 'in_production'
  | 'completed';

export interface CreatorEngagement {
  id: string;
  campaignId: string;
  creatorId: string;
  creator: Creator;
  status: EngagementStatus;
  invitationSentAt: string;
  responseReceivedAt?: string;
  agreedFeeINR: number;
  rightsConfirmed: boolean;
  rightsConfirmedAt?: string;
  paymentStatus: 'Escrow Funded' | 'Milestone 1 Released' | 'Final Released' | 'Pending Funding';
  notes: string;
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

export type PageView = 
  | 'discovery'
  | 'campaigns'
  | 'campaign-detail'
  | 'profile'
  | 'brief-builder'
  | 'briefs-feed'
  | 'creator-studio'
  | 'analytics';

export interface PlatformAnalytics {
  avgShortlistTimeHours: number;
  matchAcceptanceRatePct: number;
  creatorResponseRatePct: number;
  timeToSelectionDays: number;
  shortlistToEngagementPct: number;
  campaignCompletionRatePct: number;
  avgRevisionRounds: number;
  deliveryValidationPassRatePct: number;
  rightsConflictsPrevented: number;
  totalCampaignsManaged: number;
  totalCreatorsCommissioned: number;
}

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
  avgTurnaround: string;
  availableNow: boolean;
  portfolio: PortfolioItem[];
  reviews?: CreatorReview[];
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

export interface Brief {
  id: string;
  title: string;
  brandName: string;
  brandAvatar?: string;
  contentType: string;
  style: string;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  commercialUse: 'Full Buyout' | 'Licensed';
  budget: string;
  deadline: string;
  description: string;
  requiredTools: string[];
  deliverables?: string[];
  status?: 'Open' | 'In Review' | 'In Production';
  createdAt?: string;
  applicantsCount?: number;
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

export type PageView = 'discovery' | 'profile' | 'brief-builder' | 'briefs-feed' | 'creator-studio';

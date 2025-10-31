export interface BidBreakdownItem {
  description: string;
  rate: number;
  quantity: number;
  subtotal: number;
}

export interface TeamMember {
  name: string;
  role: string;
  experience?: string;
}

export interface PastProject {
  title: string;
  client: string;
  value?: number;
  completionDate?: string;
}

export interface BidAttachment {
  name: string;
  url: string;
  size?: number;
}

export interface TechnicalBid {
  methodology: string;
  warranty: string;
  leadTime: string;
  technicalApproach: string;
  teamComposition: TeamMember[];
  pastProjects: PastProject[];
  attachments: BidAttachment[];
}

export interface FinancialBid {
  totalAmount: number;
  timelineDays: number;
  validityDays: number;
  breakdown: BidBreakdownItem[];
  paymentTerms: string;
  attachments: BidAttachment[];
}

export interface BidSecurity {
  type: 'bank_guarantee' | 'demand_draft' | 'fixed_deposit';
  amount: number;
  status: 'pending' | 'verified' | 'rejected';
  documentUrl?: string;
}

export interface Bid {
  id: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  status: 'draft' | 'technical_submitted' | 'financial_submitted' | 'submitted' | 'withdrawn' | 'shortlisted' | 'awarded' | 'rejected';
  score?: number;
  technicalBid?: TechnicalBid;
  financialBid?: FinancialBid;
  bidSecurity?: BidSecurity;
  evaluationScore?: number;
  createdAt: string;
  updatedAt: string;
  // Legacy fields for backward compatibility
  totalAmount?: number;
  timelineDays?: number;
  validityDays?: number;
  breakdown?: BidBreakdownItem[];
  methodology?: string;
  warranty?: string;
  leadTime?: string;
  exclusions?: string;
}

export interface CreateTechnicalBidRequest {
  rfqId: string;
  methodology: string;
  warranty: string;
  leadTime: string;
  technicalApproach: string;
  teamComposition: TeamMember[];
  pastProjects: PastProject[];
}

export interface CreateFinancialBidRequest {
  rfqId: string;
  totalAmount: number;
  timelineDays: number;
  validityDays: number;
  breakdown: BidBreakdownItem[];
  paymentTerms: string;
}

// Legacy interface for backward compatibility
export interface CreateBidRequest {
  rfqId: string;
  totalAmount: number;
  timelineDays: number;
  validityDays: number;
  breakdown: BidBreakdownItem[];
  methodology: string;
  warranty: string;
  leadTime: string;
  exclusions: string;
}

export interface BidComparison {
  vendorId: string;
  vendorName: string;
  totalAmount: number;
  timelineDays: number;
  priceScore: number;
  timelineScore: number;
  experienceScore: number;
  qualityScore: number;
  finalScore: number;
  breakdown: BidBreakdownItem[];
}

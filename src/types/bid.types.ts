export interface BidBreakdownItem {
  boqItemId: string;
  rate: number;
  amount: number;
}

export interface Bid {
  id: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  totalAmount: number;
  timelineDays: number;
  validityDays: number;
  breakdown: BidBreakdownItem[];
  methodology: string;
  warranty: string;
  leadTime: string;
  exclusions: string;
  status: 'submitted' | 'withdrawn' | 'shortlisted' | 'awarded' | 'rejected';
  evaluationScore?: number;
  createdAt: string;
  updatedAt: string;
}

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

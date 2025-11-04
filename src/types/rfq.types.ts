export interface BOQ {
  _id: string;
  version: number;
  createdBy: string;
  items: BOQItem[];
  attachments: any[];
  createdAt: string;
  updatedAt: string;
}



export interface EligibilityCriteria {
  title: string;
  description: string;
  type: 'mandatory' | 'desirable';
  weight?: number;
}

export interface TenderDocumentTemplate {
  id: string;
  name: string;
  description: string;
  sections: TenderSection[];
  createdAt: string;
}

export interface TenderSection {
  title: string;
  content: string;
  order: number;
}

export interface EligibilityCriteria {
  title: string;
  description: string;
  type: 'mandatory' | 'preferable';
}

export interface TechnicalSpecification {
  title: string;
  description: string;
  isMandatory: boolean;
}

export interface EvaluationWeights {
  priceWeight: number;
  timelineWeight: number;
  ratingWeight: number;
  certificationWeight: number;
  maxPrice: number;
  maxTimeline: number;
}

export interface Addendum {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface RFQAttachment {
  _id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}

export interface RFQ {
  _id: string;
  id?: string;
  title: string;
  description: string;
  categoryId: any;
  buildingId: any;
  orgId: string;
  createdBy: any;
  estBudgetMin: number;
  estBudgetMax: number;
  closeDate: string;
  preBidQueryDeadline?: string;
  visibility: 'public' | 'private';
  inviteList: string[];
  tenderDocumentTemplate?: string;
  eligibilityCriteria: EligibilityCriteria[];
  technicalSpecifications: TechnicalSpecification[];
  evaluationWeights: EvaluationWeights;
  boqId: BOQ; // CHANGED: Replace boqItems with boqId
  eligibilityCriteria: EligibilityCriteria[];
  status: 'draft' | 'published' | 'closed' | 'awarded';
  tenderDocumentTemplate?: any;
  addenda: Addendum[];
  attachments: RFQAttachment[];
  bidCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRFQRequest {
  title: string;
  description: string;
  buildingId: string;
  categoryId: string;
  estBudgetMin: number;
  estBudgetMax: number;
  closeDate: string;
  preBidQueryDeadline?: string;
  visibility: 'public' | 'private';
  tenderDocumentTemplate?: string;
  eligibilityCriteria: Array<{
    title: string;
    description: string;
    type: 'mandatory' | 'preferable';
  }>;
  technicalSpecifications: Array<{
    title: string;
    description: string;
    isMandatory: boolean;
  }>;
  evaluationWeights: {
    priceWeight: number;
    timelineWeight: number;
    ratingWeight: number;
    certificationWeight: number;
    maxPrice: number;
    maxTimeline: number;
  };
  boqItems: Array<{
    description: string;
    unit: string;
    quantity: number;
    baselineRate: number;
    spec?: string;
  }>;
}
export interface PreBidQuery {
  id: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  category: string;
  question: string;
  response?: string;
  respondedBy?: string;
  status: 'pending' | 'answered';
  createdAt: string;
  respondedAt?: string;
}

export interface UpdateRFQRequest {
  _id: string;
  title?: string;
  description?: string;
  estBudgetMin?: number;
  estBudgetMax?: number;
  closeDate?: string;
  boqItems?: BOQItem[];
}

export interface RFQFilters {
  status?: string;
  category?: string;
  building?: string;
  search?: string;
  page?: number;
  limit?: number;
}
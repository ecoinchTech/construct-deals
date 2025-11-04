export interface BOQItem {
  _id?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  totalPrice?: number;
}

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
  categoryId: string;
  buildingId: string;
  estBudgetMin: number;
  estBudgetMax: number;
  closeDate: string;
  preBidQueryDeadline?: string;
  visibility: 'public' | 'private';
  inviteList?: string[];
  evaluationWeights: EvaluationWeights;
  boqItems: BOQItem[];
  eligibilityCriteria?: EligibilityCriteria[];
  tenderDocumentTemplate?: string;
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
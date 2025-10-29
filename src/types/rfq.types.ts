export interface BOQItem {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  estimatedRate?: number;
}

export interface EvaluationWeights {
  price: number;
  timeline: number;
  experience: number;
  quality: number;
}

export interface Addendum {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface RFQAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}

export interface RFQ {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  buildingId: string;
  organizationId: string;
  estBudgetMin: number;
  estBudgetMax: number;
  closeDate: string;
  visibility: 'public' | 'private';
  inviteList: string[];
  evaluationWeights: EvaluationWeights;
  boqItems: BOQItem[];
  status: 'draft' | 'published' | 'closed' | 'awarded';
  addenda: Addendum[];
  attachments: RFQAttachment[];
  bidCount: number;
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
  visibility: 'public' | 'private';
  inviteList?: string[];
  evaluationWeights: EvaluationWeights;
  boqItems: Omit<BOQItem, 'id'>[];
}

export interface UpdateRFQRequest {
  id: string;
  title?: string;
  description?: string;
  estBudgetMin?: number;
  estBudgetMax?: number;
  closeDate?: string;
  boqItems?: Omit<BOQItem, 'id'>[];
}

export interface RFQFilters {
  status?: string;
  category?: string;
  building?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PreBidQuery {
  id: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  category: string;
  question: string;
  response?: string;
  respondedBy?: string;
  respondedByName?: string;
  status: 'pending' | 'answered';
  createdAt: string;
  respondedAt?: string;
}

export interface CreatePreBidQueryRequest {
  rfqId: string;
  category: string;
  question: string;
}

export interface RespondToQueryRequest {
  queryId: string;
  response: string;
}

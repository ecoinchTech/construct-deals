export interface DisputeEvidence {
  id: string;
  description: string;
  attachmentUrl: string;
  uploadedBy: string;
  createdAt: string;
}

export interface Dispute {
  id: string;
  contractId: string;
  raisedBy: string;
  againstId: string;
  title: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  evidence: DisputeEvidence[];
  resolution?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDisputeRequest {
  contractId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export interface UpdateDisputeRequest {
  id: string;
  status?: 'open' | 'under_review' | 'resolved' | 'closed';
  resolution?: string;
}

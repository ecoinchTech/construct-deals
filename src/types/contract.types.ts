export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'approved' | 'rejected';
  progress?: number;
  completedAt?: string;
}

export interface Contract {
  id: string;
  rfqId: string;
  bidId: string;
  vendorId: string;
  organizationId: string;
  buildingId: string;
  title: string;
  description: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed' | 'terminated';
  milestones: Milestone[];
  terms: string;
  createdAt: string;
  updatedAt: string;
  vendorName?: string;
  organizationName?: string;
}

export interface CreateContractRequest {
  rfqId: string;
  bidId: string;
  title: string;
  description: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  milestones: Omit<Milestone, 'id' | 'status' | 'completedAt'>[];
  terms: string;
}

export interface UpdateMilestoneProgressRequest {
  contractId: string;
  milestoneId: string;
  progress: number;
  notes?: string;
}

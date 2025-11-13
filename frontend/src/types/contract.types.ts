// src/types/contract.types.ts

export interface ProgressUpdate {
  updatedBy: string;
  updateDate: string;
  comment: string;
  attachments: Array<{
    name: string;
    url: string;
  }>;
  percentage: number;
}

export interface Milestone {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'approved' | 'rejected';
  progressUpdates: ProgressUpdate[];
}

export interface Contract {
  _id: string;
  rfqId: {
    _id: string;
    title: string;
    description: string;
  };
  awardedTo: {
    _id: string;
    companyName: string;
    ratingAvg?: number;
  };
  signedByOrg: boolean;
  signedByVendor: boolean;
  finalBOQId: {
    _id: string;
    version: number;
  };
  milestones: Milestone[];
  paymentTerms: string;
  status: 'pending_vendor_acceptance' | 'pending_org_approval' | 'active' | 'completed' | 'declined';
  contractDocument?: {
    name: string;
    url: string;
  };
  startDate?: string;
  expectedEndDate: string;
  actualEndDate?: string;
  totalContractValue: number;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractRequest {
  rfqId: string;
  bidId: string;
}

export interface UpdateMilestoneProgressRequest {
  contractId: string;
  milestoneId: string;
  comment: string;
  percentage: number;
  attachments?: Array<{
    name: string;
    url: string;
  }>;
}

export interface ApproveMilestoneRequest {
  contractId: string;
  milestoneId: string;
  comment?: string;
}

export interface RejectMilestoneRequest {
  contractId: string;
  milestoneId: string;
  comment?: string;
}
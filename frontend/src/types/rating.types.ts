export interface Rating {
  id: string;
  contractId: string;
  vendorId: string;
  organizationId: string;
  ratedBy: string;
  qualityScore: number;
  timelinessScore: number;
  communicationScore: number;
  overallScore: number;
  comments: string;
  createdAt: string;
  vendorName?: string;
  organizationName?: string;
}

export interface CreateRatingRequest {
  contractId: string;
  qualityScore: number;
  timelinessScore: number;
  communicationScore: number;
  comments: string;
}

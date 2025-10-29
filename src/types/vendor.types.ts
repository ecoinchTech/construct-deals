export interface Vendor {
  id: string;
  userId: string;
  companyName: string;
  categories: string[];
  serviceCities: string[];
  profileSummary: string;
  portfolioUrls: string[];
  gstNumber: string;
  panNumber: string;
  kycStatus: 'pending' | 'approved' | 'rejected';
  kycDocuments: KYCDocument[];
  rating: number;
  reviewCount: number;
  featured: boolean;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KYCDocument {
  id: string;
  type: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
}

export interface CreateVendorRequest {
  companyName: string;
  categories: string[];
  serviceCities: string[];
  profileSummary: string;
  portfolioUrls: string[];
  gstNumber: string;
  panNumber: string;
}

export interface UpdateVendorRequest {
  id: string;
  companyName?: string;
  categories?: string[];
  serviceCities?: string[];
  profileSummary?: string;
  portfolioUrls?: string[];
  gstNumber?: string;
  panNumber?: string;
}

export interface VendorFilters {
  category?: string;
  city?: string;
  minRating?: number;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

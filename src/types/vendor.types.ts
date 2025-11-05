export interface Vendor {
  _id: string;
  id: string;
  userId: string;
  companyName: string;
  categories: Category[];
  serviceCities: string[];
  profileSummary: string;
  portfolioUrls: string[];
  gstNumber: string;
  panNumber: string;
  kycStatus: 'pending' | 'approved' | 'rejected';
  kycDocuments: KYCDocument[];
  rating: number;
  ratingAvg?: number;
  reviewCount: number;
  totalRatings?: number;
  featured: boolean;
  isFeatured?: boolean;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
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

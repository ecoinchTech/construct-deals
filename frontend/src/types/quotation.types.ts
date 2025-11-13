// Quotation Types for Phase 2 Hybrid E-commerce System

export interface QuotationDeliveryLocation {
  address: string;
  city: string;
  state: string;
  pincode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface QuotationBudget {
  min: number;
  max: number;
  currency: string;
}

export interface QuotationResponse {
  _id: string;
  vendor: {
    _id: string;
    companyName: string;
    email: string;
    phone: string;
  };
  price: number;
  message: string;
  attachments?: string[];
  validityDays: number;
  createdAt: string;
}

export interface QuotationRequest {
  _id: string;
  buyer: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  vendor: {
    _id: string;
    companyName: string;
    email?: string;
    phone?: string;
    rating?: number;
  };
  product: {
    _id: string;
    name: string;
    sku: string;
    images?: Array<{
      url: string;
      alt: string;
    }>;
    specifications?: Record<string, any>;
  };
  variant: {
    _id: string;
    name: string;
    sku: string;
    specifications?: Record<string, any>;
  };
  quantity: number;
  requirements: string;
  deliveryLocation: QuotationDeliveryLocation;
  expectedDeliveryDate?: string;
  budget?: QuotationBudget;
  status: 'pending' | 'responded' | 'accepted' | 'rejected' | 'expired';
  responses: QuotationResponse[];
  selectedResponse?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Request/Response Types for API calls
export interface CreateQuotationRequest {
  productId: string;
  variantId: string;
  vendorId: string;
  quantity: number;
  requirements: string;
  deliveryLocation: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  expectedDeliveryDate?: string;
  budget?: {
    min: number;
    max: number;
  };
}

export interface RespondToQuotationRequest {
  price: number;
  message: string;
  attachments?: string[];
  validityDays: number;
}

export interface QuotationQueryParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'responded' | 'accepted' | 'rejected' | 'expired';
}

// API Response Types
export interface QuotationsListResponse {
  success: boolean;
  message: string;
  data: {
    quotationRequests: QuotationRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  timestamp: string;
}

export interface QuotationDetailResponse {
  success: boolean;
  message: string;
  data: QuotationRequest;
  timestamp: string;
}

export interface QuotationMutationResponse {
  success: boolean;
  message: string;
  data: QuotationRequest;
  timestamp: string;
}

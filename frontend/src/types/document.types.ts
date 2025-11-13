export type DocumentCategory = 
  | 'rfq_document' 
  | 'bid_document' 
  | 'contract_document'
  | 'invoice_document'
  | 'kyc_document'
  | 'technical_document'
  | 'financial_document'
  | 'legal_document'
  | 'other';

export interface Document {
  _id: string;
  name: string;
  category: DocumentCategory;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  relatedTo?: {
    type: 'rfq' | 'bid' | 'contract' | 'invoice' | 'vendor' | 'organization';
    id: string;
  };
  tags?: string[];
  isPublic: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadDocumentRequest {
  name: string;
  category: DocumentCategory;
  file: File;
  relatedTo?: {
    type: 'rfq' | 'bid' | 'contract' | 'invoice' | 'vendor' | 'organization';
    id: string;
  };
  tags?: string[];
  isPublic?: boolean;
  description?: string;
}

export interface UpdateDocumentRequest {
  id: string;
  name?: string;
  category?: DocumentCategory;
  tags?: string[];
  isPublic?: boolean;
  description?: string;
}

export interface DocumentFilters {
  category?: DocumentCategory;
  uploadedBy?: string;
  relatedTo?: {
    type: string;
    id: string;
  };
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
}

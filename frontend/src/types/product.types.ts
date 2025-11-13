// Product Category Types
export interface CategoryAttribute {
  name: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean';
  required: boolean;
  unit?: string;
  options?: string[];
}

export interface ProductCategory {
  _id: string;
  id: string;
  name: string;
  description: string;
  parentId?: string;
  level: number;
  attributes: CategoryAttribute[];
  icon?: string;
  image?: string;
  status: 'active' | 'inactive';
  children?: ProductCategory[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
  parentId?: string;
  attributes?: CategoryAttribute[];
  icon?: string;
  image?: string;
}

export interface UpdateCategoryRequest {
  id: string;
  name?: string;
  description?: string;
  parentId?: string;
  attributes?: CategoryAttribute[];
  icon?: string;
  image?: string;
  status?: 'active' | 'inactive';
}

// Product Types
export interface ProductImage {
  url: string;
  alt: string;
  isPrimary?: boolean;
}

export interface ProductWeight {
  value: number;
  unit: 'kg' | 'g' | 'lb' | 'oz';
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'm' | 'in' | 'ft';
}

export interface ProductInventory {
  quantity: number;
  trackQuantity: boolean;
  allowBackorder: boolean;
  lowStockThreshold?: number;
}

export interface ProductShipping {
  requiresShipping: boolean;
  taxable: boolean;
}

export interface ProductVariant {
  _id: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  weight?: ProductWeight;
  dimensions?: ProductDimensions;
  attributes: Record<string, any>;
  images?: ProductImage[];
  inventory: ProductInventory;
  shipping: ProductShipping;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  id: string;
  name: string;
  description: string;
  category: {
    _id: string;
    name: string;
    attributes?: CategoryAttribute[];
  };
  brand: string;
  model: string;
  sku: string;
  images: ProductImage[];
  specifications: Record<string, any>;
  tags: string[];
  status: 'active' | 'inactive' | 'draft';
  averageRating?: number;
  reviewCount?: number;
  variants: ProductVariant[];
  vendorProducts?: VendorProduct[];
  minPrice?: number;
  maxPrice?: number;
  score?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  category: string;
  brand: string;
  model: string;
  sku: string;
  specifications: Record<string, any>;
  tags: string[];
  variants: Omit<ProductVariant, '_id' | 'createdAt' | 'updatedAt'>[];
}

export interface UpdateProductRequest {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  brand?: string;
  model?: string;
  sku?: string;
  specifications?: Record<string, any>;
  tags?: string[];
  status?: 'active' | 'inactive' | 'draft';
}

// Vendor Product Types
export interface VendorDeliveryOption {
  name: string;
  estimatedDays: number;
  charges: number;
  isActive: boolean;
}

export interface VendorReturnPolicy {
  days: number;
  conditions: string;
}

export interface VendorProductVariant {
  variant: {
    _id: string;
    name: string;
    sku: string;
  };
  price: number;
  compareAtPrice?: number;
  inventory: ProductInventory;
  isActive: boolean;
}

export interface VendorProduct {
  _id: string;
  id: string;
  vendor: {
    _id: string;
    companyName: string;
    rating?: number;
  };
  product?: {
    _id: string;
    name: string;
    description?: string;
    sku: string;
    images?: ProductImage[];
    specifications?: Record<string, any>;
    tags?: string[];
  };
  variants: VendorProductVariant[];
  commissionRate: number;
  status: 'pending_approval' | 'active' | 'inactive' | 'rejected';
  notes?: string;
  returnPolicy: VendorReturnPolicy;
  deliveryOptions: VendorDeliveryOption[];
  approvedBy?: {
    _id: string;
    name: string;
  };
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorProductRequest {
  productId: string;
  variants: {
    variant: string;
    price: number;
    compareAtPrice?: number;
    inventory: ProductInventory;
    isActive: boolean;
  }[];
  commissionRate: number;
  notes?: string;
  returnPolicy: VendorReturnPolicy;
  deliveryOptions: VendorDeliveryOption[];
}

export interface UpdateVendorProductRequest {
  id: string;
  variants?: {
    variant: string;
    price: number;
    compareAtPrice?: number;
    inventory: ProductInventory;
    isActive: boolean;
  }[];
  commissionRate?: number;
  notes?: string;
  returnPolicy?: VendorReturnPolicy;
  deliveryOptions?: VendorDeliveryOption[];
  status?: 'active' | 'inactive';
}

// Product Review Types
export interface ProductReview {
  _id: string;
  productId: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  rating: number;
  comment: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

// Query Parameters
export interface ProductQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  tags?: string;
}

export interface ProductSearchParams extends ProductQueryParams {
  q: string;
  rating?: number;
}

export interface CartItem {
  _id: string;
  cartId: string;
  productId: string;
  variantId: string;
  vendorProductId: string;
  product: {
    _id: string;
    name: string;
    sku: string;
    images: Array<{
      url: string;
      alt: string;
    }>;
  };
  variant: {
    _id: string;
    name: string;
    sku: string;
    attributes: Record<string, any>;
  };
  vendor: {
    _id: string;
    companyName: string;
  };
  vendorProduct: {
    _id: string;
  };
  quantity: number;
  price: number;
  compareAtPrice?: number;
  type: 'standard' | 'quotation';
  quotationId?: string;
  deliveryOption: {
    name: string;
    estimatedDays: number;
    charges: number;
  };
  customization?: {
    requirements: string;
    specifications: Record<string, any>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  appliedCoupon?: {
    code: string;
    discount: number;
    discountType: 'percentage' | 'fixed';
  };
  pricing: {
    subtotal: number;
    deliveryCharges: number;
    discount: number;
    tax: number;
    total: number;
    standardItemsTotal: number;
    quotationItemsTotal: number;
  };
  summary: {
    subtotal: number;
    deliveryCharges: number;
    discount: number;
    tax: number;
    total: number;
    standardItemsTotal: number;
    quotationItemsTotal: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: string;
  variantId: string;
  vendorProductId: string;
  quantity: number;
  type: 'standard' | 'quotation';
  deliveryOption?: {
    name: string;
    estimatedDays: number;
    charges: number;
  };
  customization?: {
    requirements: string;
    specifications: Record<string, any>;
  };
}

export interface UpdateCartItemRequest {
  itemId: string;
  quantity: number;
  deliveryOption?: {
    name: string;
    estimatedDays: number;
    charges: number;
  };
}

export interface ApplyCouponRequest {
  couponCode: string;
}

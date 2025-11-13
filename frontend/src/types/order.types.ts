export interface OrderAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  _id: string;
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
  quantity: number;
  price: number;
  deliveryOption: {
    name: string;
    estimatedDays: number;
    charges: number;
  };
  type: 'standard' | 'quotation';
  quotationId?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  tracking?: {
    number: string;
    carrier: string;
    url: string;
  };
}

export interface Order {
  _id: string;
  id: string;
  orderNumber: string;
  userId: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  payment: {
    method: 'card' | 'upi' | 'netbanking' | 'wallet' | 'cod';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    transactionId?: string;
    amount: number;
  };
  pricing: {
    subtotal: number;
    deliveryCharges: number;
    discount: number;
    tax: number;
    total: number;
  };
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

export interface CreateOrderRequest {
  items: {
    productId: string;
    variantId: string;
    vendorProductId: string;
    quantity: number;
    deliveryOption: {
      name: string;
      estimatedDays: number;
      charges: number;
    };
    type: 'standard' | 'quotation';
    quotationId?: string;
  }[];
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet' | 'cod';
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  orderId: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

export interface CancelOrderRequest {
  orderId: string;
  reason: string;
}

export interface UpdateTrackingRequest {
  orderId: string;
  itemId: string;
  trackingNumber: string;
  carrier: string;
  url?: string;
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

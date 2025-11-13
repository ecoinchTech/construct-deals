export type PaymentMethod = 'bank_transfer' | 'check' | 'online' | 'upi' | 'credit_card' | 'debit_card' | 'netbanking' | 'wallet' | 'cod';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  _id: string;
  invoiceId?: string;
  orderId?: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  gatewayTransactionId?: string;
  gatewayResponse?: any;
  reference?: string;
  paidAt?: string;
  notes?: string;
  billingAddress?: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    gstin?: string;
  };
  paymentDetails?: {
    cardLast4?: string;
    bankName?: string;
    upiId?: string;
    walletId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  transactionId?: string;
  reference?: string;
  notes?: string;
}

export interface UpdatePaymentRequest {
  id: string;
  status?: PaymentStatus;
  transactionId?: string;
  reference?: string;
  notes?: string;
}

export interface PaymentFilters {
  invoiceId?: string;
  orderId?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Phase 2 Payment Types
export interface ProcessPaymentRequest {
  orderId: string;
  paymentMethod: PaymentMethod;
  billingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    gstin?: string;
  };
  paymentDetails?: {
    cardNumber?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cvv?: string;
    upiId?: string;
    walletId?: string;
  };
}

export interface RefundPaymentRequest {
  paymentId: string;
  amount: number;
  reason: string;
}

export interface PaymentHistoryParams {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
}

export interface PaymentHistoryResponse {
  success: boolean;
  message: string;
  data: {
    payments: Payment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  timestamp: string;
}

export type PaymentMethod = 'bank_transfer' | 'check' | 'online' | 'upi';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  _id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  reference?: string;
  paidAt?: string;
  notes?: string;
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
  status?: PaymentStatus;
  method?: PaymentMethod;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  contractId: string;
  milestoneId: string;
  vendorId: string;
  organizationId: string;
  invoiceNumber: string;
  amount: number;
  gst: number;
  totalAmount: number;
  lineItems: InvoiceLineItem[];
  dueDate: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  vendorName?: string;
  organizationName?: string;
}

export interface CreateInvoiceRequest {
  contractId: string;
  milestoneId: string;
  amount: number;
  lineItems: InvoiceLineItem[];
  dueDate: string;
  notes?: string;
}

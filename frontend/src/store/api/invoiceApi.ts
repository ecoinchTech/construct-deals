import { apiSlice } from './apiSlice';
import { Invoice, CreateInvoiceRequest } from '@/types/invoice.types';

export const invoiceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInvoices: builder.query<{ success: boolean; data: { invoices: Invoice[] } }, string>({
      query: (contractId) => `/invoices/contracts/${contractId}`,
      providesTags: ['Invoice'],
    }),
    getInvoice: builder.query<{ success: boolean; data: { invoice: Invoice } }, string>({
      query: (id) => `/invoices/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Invoice', id }],
    }),
    createInvoice: builder.mutation<{ success: boolean; data: { invoice: Invoice } }, CreateInvoiceRequest>({
      query: (body) => ({
        url: '/invoices',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Invoice', 'Contract'],
    }),
    approveInvoice: builder.mutation<{ success: boolean; data: { invoice: Invoice } }, string>({
      query: (id) => ({
        url: `/invoices/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Invoice', id }, 'Invoice'],
    }),
    rejectInvoice: builder.mutation<{ success: boolean; data: { invoice: Invoice } }, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/invoices/${id}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Invoice', id }, 'Invoice'],
    }),
    markAsPaid: builder.mutation<{ success: boolean; data: { invoice: Invoice } }, string>({
      query: (id) => ({
        url: `/invoices/${id}/mark-paid`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Invoice', id }, 'Invoice'],
    }),
    uploadAttachment: builder.mutation<{ success: boolean; data: { invoice: Invoice } }, { id: string; files: FormData }>({
      query: ({ id, files }) => ({
        url: `/invoices/${id}/attachments`,
        method: 'POST',
        body: files,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Invoice', id }],
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useCreateInvoiceMutation,
  useApproveInvoiceMutation,
  useRejectInvoiceMutation,
  useMarkAsPaidMutation,
  useUploadAttachmentMutation,
} = invoiceApi;

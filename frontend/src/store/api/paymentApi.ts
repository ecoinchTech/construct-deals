import { apiSlice } from './apiSlice';
import {
  Payment,
  CreatePaymentRequest,
  UpdatePaymentRequest,
  PaymentFilters,
  ProcessPaymentRequest,
  RefundPaymentRequest,
  PaymentHistoryParams,
  PaymentHistoryResponse,
} from '@/types/payment.types';

export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<{ payments: Payment[]; total: number; page: number; totalPages: number }, PaymentFilters>({
      query: (filters) => ({
        url: '/payments',
        params: filters,
      }),
      providesTags: ['Payment'],
    }),
    getPaymentById: builder.query<Payment, string>({
      query: (id) => `/payments/${id}`,
      providesTags: ['Payment'],
    }),
    createPayment: builder.mutation<Payment, CreatePaymentRequest>({
      query: (data) => ({
        url: '/payments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payment', 'Invoice'],
    }),
    updatePayment: builder.mutation<Payment, UpdatePaymentRequest>({
      query: ({ id, ...data }) => ({
        url: `/payments/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Payment', 'Invoice'],
    }),
    
    // Phase 2 Payment Endpoints
    processPayment: builder.mutation<
      { success: boolean; message: string; data: Payment },
      ProcessPaymentRequest
    >({
      query: (body) => ({
        url: '/payments/process',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Payment', 'Order'],
    }),
    
    refundPayment: builder.mutation<
      { success: boolean; message: string; data: Payment },
      RefundPaymentRequest
    >({
      query: (body) => ({
        url: '/payments/refund',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Payment', 'Order'],
    }),
    
    getPaymentHistory: builder.query<PaymentHistoryResponse, PaymentHistoryParams>({
      query: (params) => ({
        url: '/payments/history',
        params,
      }),
      providesTags: ['Payment'],
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useProcessPaymentMutation,
  useRefundPaymentMutation,
  useGetPaymentHistoryQuery,
} = paymentApi;

import { apiSlice } from './apiSlice';
import { Payment, CreatePaymentRequest, UpdatePaymentRequest, PaymentFilters } from '@/types/payment.types';

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
  }),
});

export const {
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
} = paymentApi;

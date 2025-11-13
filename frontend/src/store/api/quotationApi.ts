import { apiSlice } from './apiSlice';
import {
  QuotationRequest,
  QuotationsListResponse,
  QuotationDetailResponse,
  QuotationMutationResponse,
  CreateQuotationRequest,
  RespondToQuotationRequest,
  QuotationQueryParams,
} from '@/types/quotation.types';

export const quotationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get buyer's quotation requests
    getQuotations: builder.query<QuotationsListResponse, QuotationQueryParams>({
      query: (params) => ({
        url: '/quotations',
        params,
      }),
      providesTags: ['Quotation'],
    }),

    // Get vendor's quotation requests
    getVendorQuotations: builder.query<QuotationsListResponse, QuotationQueryParams>({
      query: (params) => ({
        url: '/quotations/vendor',
        params,
      }),
      providesTags: ['Quotation'],
    }),

    // Get specific quotation request
    getQuotation: builder.query<QuotationDetailResponse, string>({
      query: (id) => `/quotations/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Quotation', id }],
    }),

    // Create quotation request (Buyer)
    createQuotation: builder.mutation<QuotationMutationResponse, CreateQuotationRequest>({
      query: (body) => ({
        url: '/quotations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Quotation', 'Cart'],
    }),

    // Respond to quotation request (Vendor)
    respondToQuotation: builder.mutation<
      QuotationMutationResponse,
      { id: string; response: RespondToQuotationRequest }
    >({
      query: ({ id, response }) => ({
        url: `/quotations/${id}/respond`,
        method: 'PUT',
        body: response,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Quotation', id }, 'Quotation'],
    }),

    // Accept quotation response (Buyer)
    acceptQuotation: builder.mutation<
      QuotationMutationResponse,
      { id: string; responseId: string }
    >({
      query: ({ id, responseId }) => ({
        url: `/quotations/${id}/accept/${responseId}`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Quotation', id },
        'Quotation',
        'Cart',
        'Order',
      ],
    }),

    // Reject quotation request (Buyer)
    rejectQuotation: builder.mutation<QuotationMutationResponse, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/quotations/${id}/reject`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Quotation', id }, 'Quotation'],
    }),
  }),
});

export const {
  useGetQuotationsQuery,
  useGetVendorQuotationsQuery,
  useGetQuotationQuery,
  useCreateQuotationMutation,
  useRespondToQuotationMutation,
  useAcceptQuotationMutation,
  useRejectQuotationMutation,
} = quotationApi;

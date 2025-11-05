import { apiSlice } from './apiSlice';
import { Bid, CreateBidRequest, BidComparison, CreateTechnicalBidRequest, CreateFinancialBidRequest, CreateBidSecurityRequest } from '@/types/bid.types';

export const bidApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBidsByRFQ: builder.query<{ success: boolean; data: { bids: Bid[] } }, string>({
      query: (rfqId) => `/bids/rfqs/${rfqId}`,
      providesTags: (_result, _error, rfqId) => [{ type: 'Bid', id: rfqId }],
    }),
    getBid: builder.query<{ success: boolean; data: { bid: Bid } }, string>({
      query: (id) => `/bids/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Bid', id }],
    }),
    createBid: builder.mutation<{ success: boolean; data: { bid: Bid } }, CreateBidRequest>({
      query: (body) => ({
        url: `/bids/rfqs/${body.rfqId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { rfqId }) => [{ type: 'Bid', id: rfqId }, 'RFQ'],
    }),
    withdrawBid: builder.mutation<{ success: boolean; data: { bid: Bid } }, string>({
      query: (id) => ({
        url: `/bids/${id}/withdraw`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Bid', id }],
    }),
    getBidComparison: builder.query<{ success: boolean; data: { comparison: BidComparison[]; evaluationWeights: any } }, string>({
      query: (rfqId) => `/bids/rfqs/${rfqId}/comparison`,
      providesTags: (_result, _error, rfqId) => [{ type: 'Bid', id: rfqId }],
    }),
    createTechnicalBid: builder.mutation<{ success: boolean; data: { bid: Bid } }, CreateTechnicalBidRequest>({
      query: ({ rfqId, ...body }) => ({
        url: `/bids/rfqs/${rfqId}/technical`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { rfqId }) => [{ type: 'Bid', id: rfqId }, 'RFQ'],
    }),
    createFinancialBid: builder.mutation<{ success: boolean; data: { bid: Bid } }, CreateFinancialBidRequest>({
      query: ({ rfqId, ...body }) => ({
        url: `/bids/rfqs/${rfqId}/financial`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { rfqId }) => [{ type: 'Bid', id: rfqId }, 'RFQ'],
    }),
    uploadBidAttachment: builder.mutation<{ success: boolean; data: { bid: Bid } }, { bidId: string; files: FormData }>({
      query: ({ bidId, files }) => ({
        url: `/bids/${bidId}/attachments`,
        method: 'POST',
        body: files,
      }),
      invalidatesTags: (_result, _error, { bidId }) => [{ type: 'Bid', id: bidId }],
    }),
    createBidSecurity: builder.mutation<{ success: boolean; data: { bid: Bid } }, CreateBidSecurityRequest>({
      query: ({ rfqId, ...body }) => ({
        url: `/bids/rfqs/${rfqId}/security`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { rfqId }) => [{ type: 'Bid', id: rfqId }, 'RFQ'],
    }),
  }),
});

export const {
  useGetBidsByRFQQuery,
  useGetBidQuery,
  useCreateBidMutation,
  useWithdrawBidMutation,
  useGetBidComparisonQuery,
  useCreateTechnicalBidMutation,
  useCreateFinancialBidMutation,
  useUploadBidAttachmentMutation,
  useCreateBidSecurityMutation,
} = bidApi;

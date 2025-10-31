import { apiSlice } from './apiSlice';
import { PreBidQuery, CreatePreBidQueryRequest, RespondToQueryRequest } from '@/types/pre-bid-query.types';

export const preBidQueryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPreBidQueries: builder.query<{ success: boolean; data: { queries: PreBidQuery[] } }, string>({
      query: (rfqId) => `/pre-bid-queries/rfqs/${rfqId}`,
      providesTags: (_result, _error, rfqId) => [{ type: 'PreBidQuery', id: rfqId }],
    }),
    createPreBidQuery: builder.mutation<{ success: boolean; data: { query: PreBidQuery } }, CreatePreBidQueryRequest>({
      query: (body) => ({
        url: `/pre-bid-queries/rfqs/${body.rfqId}`,
        method: 'POST',
        body: { category: body.category, question: body.question },
      }),
      invalidatesTags: (_result, _error, { rfqId }) => [{ type: 'PreBidQuery', id: rfqId }],
    }),
    respondToQuery: builder.mutation<{ success: boolean; data: { query: PreBidQuery } }, RespondToQueryRequest>({
      query: ({ queryId, response }) => ({
        url: `/pre-bid-queries/${queryId}/respond`,
        method: 'POST',
        body: { response },
      }),
      invalidatesTags: ['PreBidQuery'],
    }),
  }),
});

export const {
  useGetPreBidQueriesQuery,
  useCreatePreBidQueryMutation,
  useRespondToQueryMutation,
} = preBidQueryApi;

import { apiSlice } from './apiSlice';
import { Dispute, CreateDisputeRequest, UpdateDisputeRequest } from '@/types/dispute.types';

interface PaginatedResponse<T> {
  success: boolean;
  data: {
    disputes: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const disputeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDisputes: builder.query<PaginatedResponse<Dispute>, { page?: number; limit?: number; status?: string }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) queryParams.append(key, String(value));
        });
        return `/disputes?${queryParams.toString()}`;
      },
      providesTags: ['Dispute'],
    }),
    getDispute: builder.query<{ success: boolean; data: { dispute: Dispute } }, string>({
      query: (id) => `/disputes/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Dispute', id }],
    }),
    createDispute: builder.mutation<{ success: boolean; data: { dispute: Dispute } }, CreateDisputeRequest>({
      query: (body) => ({
        url: '/disputes',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Dispute'],
    }),
    updateDispute: builder.mutation<{ success: boolean; data: { dispute: Dispute } }, UpdateDisputeRequest>({
      query: ({ id, ...body }) => ({
        url: `/disputes/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Dispute', id }, 'Dispute'],
    }),
    submitEvidence: builder.mutation<{ success: boolean; data: { dispute: Dispute } }, { id: string; description: string; files: FormData }>({
      query: ({ id, description, files }) => ({
        url: `/disputes/${id}/evidence`,
        method: 'POST',
        body: files,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Dispute', id }],
    }),
  }),
});

export const {
  useGetDisputesQuery,
  useGetDisputeQuery,
  useCreateDisputeMutation,
  useUpdateDisputeMutation,
  useSubmitEvidenceMutation,
} = disputeApi;

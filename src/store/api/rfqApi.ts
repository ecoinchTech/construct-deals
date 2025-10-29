import { apiSlice } from './apiSlice';
import { RFQ, CreateRFQRequest, UpdateRFQRequest, RFQFilters, Addendum } from '@/types/rfq.types';

interface PaginatedResponse<T> {
  success: boolean;
  data: {
    rfqs: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const rfqApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRFQs: builder.query<PaginatedResponse<RFQ>, RFQFilters>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) queryParams.append(key, String(value));
        });
        return `/rfqs?${queryParams.toString()}`;
      },
      providesTags: ['RFQ'],
    }),
    getRFQ: builder.query<{ success: boolean; data: { rfq: RFQ } }, string>({
      query: (id) => `/rfqs/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'RFQ', id }],
    }),
    createRFQ: builder.mutation<{ success: boolean; data: { rfq: RFQ } }, CreateRFQRequest>({
      query: (body) => ({
        url: '/rfqs',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['RFQ'],
    }),
    updateRFQ: builder.mutation<{ success: boolean; data: { rfq: RFQ } }, UpdateRFQRequest>({
      query: ({ id, ...body }) => ({
        url: `/rfqs/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'RFQ', id }, 'RFQ'],
    }),
    publishRFQ: builder.mutation<{ success: boolean; data: { rfq: RFQ } }, string>({
      query: (id) => ({
        url: `/rfqs/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'RFQ', id }, 'RFQ'],
    }),
    addAddendum: builder.mutation<{ success: boolean; data: { rfq: RFQ } }, { id: string; title: string; description: string }>({
      query: ({ id, title, description }) => ({
        url: `/rfqs/${id}/addenda`,
        method: 'POST',
        body: { title, description },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'RFQ', id }],
    }),
    uploadAttachment: builder.mutation<{ success: boolean; data: { rfq: RFQ } }, { id: string; files: FormData }>({
      query: ({ id, files }) => ({
        url: `/rfqs/${id}/attachments`,
        method: 'POST',
        body: files,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'RFQ', id }],
    }),
  }),
});

export const {
  useGetRFQsQuery,
  useGetRFQQuery,
  useCreateRFQMutation,
  useUpdateRFQMutation,
  usePublishRFQMutation,
  useAddAddendumMutation,
  useUploadAttachmentMutation,
} = rfqApi;

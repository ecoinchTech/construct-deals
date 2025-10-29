import { apiSlice } from './apiSlice';
import { Vendor, CreateVendorRequest, UpdateVendorRequest, VendorFilters } from '@/types/vendor.types';

interface PaginatedResponse<T> {
  success: boolean;
  data: {
    vendors: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const vendorApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getVendors: builder.query<PaginatedResponse<Vendor>, VendorFilters>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) queryParams.append(key, String(value));
        });
        return `/vendors?${queryParams.toString()}`;
      },
      providesTags: ['Vendor'],
    }),
    getPendingVendors: builder.query<PaginatedResponse<Vendor>, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => `/vendors/pending?page=${page}&limit=${limit}`,
      providesTags: ['Vendor'],
    }),
    getVendor: builder.query<{ success: boolean; data: { vendor: Vendor } }, string>({
      query: (id) => `/vendors/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Vendor', id }],
    }),
    createVendor: builder.mutation<{ success: boolean; data: { vendor: Vendor } }, CreateVendorRequest>({
      query: (body) => ({
        url: '/vendors',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Vendor'],
    }),
    updateVendor: builder.mutation<{ success: boolean; data: { vendor: Vendor } }, UpdateVendorRequest>({
      query: ({ id, ...body }) => ({
        url: `/vendors/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Vendor', id }, 'Vendor'],
    }),
    uploadKYCDocuments: builder.mutation<{ success: boolean; data: { vendor: Vendor } }, { id: string; files: FormData }>({
      query: ({ id, files }) => ({
        url: `/vendors/${id}/kyc-documents`,
        method: 'POST',
        body: files,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Vendor', id }],
    }),
    approveVendor: builder.mutation<{ success: boolean; data: { vendor: Vendor } }, string>({
      query: (id) => ({
        url: `/vendors/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Vendor', id }, 'Vendor'],
    }),
    rejectVendor: builder.mutation<{ success: boolean; data: { vendor: Vendor } }, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/vendors/${id}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Vendor', id }, 'Vendor'],
    }),
  }),
});

export const {
  useGetVendorsQuery,
  useGetPendingVendorsQuery,
  useGetVendorQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useUploadKYCDocumentsMutation,
  useApproveVendorMutation,
  useRejectVendorMutation,
} = vendorApi;

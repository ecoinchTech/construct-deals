import { apiSlice } from './apiSlice';
import { Organization, CreateOrganizationRequest, UpdateOrganizationRequest } from '@/types/organization.types';

interface PaginationParams {
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: {
    organizations: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const organizationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizations: builder.query<PaginatedResponse<Organization>, PaginationParams>({
      query: ({ page = 1, limit = 10 }) => `/organizations?page=${page}&limit=${limit}`,
      providesTags: ['Organization'],
    }),
    getOrganization: builder.query<{ success: boolean; data: { organization: Organization } }, string>({
      query: (id) => `/organizations/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Organization', id }],
    }),
    createOrganization: builder.mutation<{ success: boolean; data: { organization: Organization } }, CreateOrganizationRequest>({
      query: (body) => ({
        url: '/organizations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Organization'],
    }),
    updateOrganization: builder.mutation<{ success: boolean; data: { organization: Organization } }, UpdateOrganizationRequest>({
      query: ({ id, ...body }) => ({
        url: `/organizations/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Organization', id }, 'Organization'],
    }),
    addPreferredVendor: builder.mutation<{ success: boolean; data: { organization: Organization } }, { organizationId: string; vendorId: string }>({
      query: ({ organizationId, vendorId }) => ({
        url: `/organizations/${organizationId}/preferred-vendors`,
        method: 'POST',
        body: { vendorId },
      }),
      invalidatesTags: (_result, _error, { organizationId }) => [{ type: 'Organization', id: organizationId }],
    }),
    removePreferredVendor: builder.mutation<{ success: boolean; data: { organization: Organization } }, { organizationId: string; vendorId: string }>({
      query: ({ organizationId, vendorId }) => ({
        url: `/organizations/${organizationId}/preferred-vendors/${vendorId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { organizationId }) => [{ type: 'Organization', id: organizationId }],
    }),
  }),
});

export const {
  useGetOrganizationsQuery,
  useGetOrganizationQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useAddPreferredVendorMutation,
  useRemovePreferredVendorMutation,
} = organizationApi;

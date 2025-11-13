import { apiSlice } from './apiSlice';
import {
  VendorProduct,
  CreateVendorProductRequest,
  UpdateVendorProductRequest,
  Product,
} from '@/types/product.types';

export const vendorProductApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getVendorProducts: builder.query<
      {
        success: boolean;
        data: {
          vendorProducts: VendorProduct[];
          pagination: { page: number; limit: number; total: number; pages: number };
        };
      },
      { page?: number; limit?: number; status?: string; productId?: string; sortBy?: string; sortOrder?: string }
    >({
      query: (params) => ({
        url: '/vendor-products',
        params,
      }),
      providesTags: ['VendorProduct'],
    }),
    getAvailableProducts: builder.query<
      {
        success: boolean;
        data: {
          products: Product[];
          pagination: { page: number; limit: number; total: number; pages: number };
        };
      },
      { page?: number; limit?: number; search?: string; category?: string }
    >({
      query: (params) => ({
        url: '/vendor-products/available',
        params,
      }),
      providesTags: ['Product'],
    }),
    getVendorProduct: builder.query<{ success: boolean; data: VendorProduct }, string>({
      query: (id) => `/vendor-products/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'VendorProduct', id }],
    }),
    createVendorProduct: builder.mutation<{ success: boolean; data: VendorProduct }, CreateVendorProductRequest>({
      query: (body) => ({
        url: '/vendor-products',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['VendorProduct'],
    }),
    updateVendorProduct: builder.mutation<{ success: boolean; data: VendorProduct }, UpdateVendorProductRequest>({
      query: ({ id, ...body }) => ({
        url: `/vendor-products/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'VendorProduct', id }, 'VendorProduct'],
    }),
    deleteVendorProduct: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/vendor-products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['VendorProduct'],
    }),
    getPendingVendorProducts: builder.query<
      {
        success: boolean;
        data: {
          vendorProducts: VendorProduct[];
          pagination: { page: number; limit: number; total: number; pages: number };
        };
      },
      { page?: number; limit?: number }
    >({
      query: (params) => ({
        url: '/vendor-products/pending/all',
        params,
      }),
      providesTags: ['VendorProduct'],
    }),
    approveVendorProduct: builder.mutation<{ success: boolean; data: VendorProduct }, string>({
      query: (id) => ({
        url: `/vendor-products/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'VendorProduct', id }, 'VendorProduct'],
    }),
    rejectVendorProduct: builder.mutation<{ success: boolean; data: VendorProduct }, { id: string; rejectionReason: string }>({
      query: ({ id, rejectionReason }) => ({
        url: `/vendor-products/${id}/reject`,
        method: 'POST',
        body: { rejectionReason },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'VendorProduct', id }, 'VendorProduct'],
    }),
  }),
});

export const {
  useGetVendorProductsQuery,
  useGetAvailableProductsQuery,
  useGetVendorProductQuery,
  useCreateVendorProductMutation,
  useUpdateVendorProductMutation,
  useDeleteVendorProductMutation,
  useGetPendingVendorProductsQuery,
  useApproveVendorProductMutation,
  useRejectVendorProductMutation,
} = vendorProductApi;

import { apiSlice } from './apiSlice';
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductQueryParams,
  ProductSearchParams,
  ProductReview,
  ProductVariant,
} from '@/types/product.types';

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<
      {
        success: boolean;
        data: {
          products: Product[];
          pagination: { page: number; limit: number; total: number; pages: number };
        };
      },
      ProductQueryParams
    >({
      query: (params) => ({
        url: '/products',
        params,
      }),
      providesTags: ['Product'],
    }),
    searchProducts: builder.query<
      {
        success: boolean;
        data: {
          products: Product[];
          pagination: { page: number; limit: number; total: number; pages: number };
          query: string;
        };
      },
      ProductSearchParams
    >({
      query: (params) => ({
        url: '/products/search',
        params,
      }),
      providesTags: ['Product'],
    }),
    getProduct: builder.query<{ success: boolean; data: Product }, string>({
      query: (id) => `/products/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),
    createProduct: builder.mutation<{ success: boolean; data: Product }, CreateProductRequest>({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation<{ success: boolean; data: Product }, UpdateProductRequest>({
      query: ({ id, ...body }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Product', id }, 'Product'],
    }),
    deleteProduct: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
    uploadProductImages: builder.mutation<{ success: boolean; data: any }, { id: string; images: any[] }>({
      query: ({ id, images }) => ({
        url: `/products/${id}/images`,
        method: 'POST',
        body: { images },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Product', id }],
    }),
    deleteProductImage: builder.mutation<{ success: boolean; data: any[] }, { id: string; imageId: string }>({
      query: ({ id, imageId }) => ({
        url: `/products/${id}/images/${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Product', id }],
    }),
    addProductVariant: builder.mutation<
      { success: boolean; data: ProductVariant },
      { id: string; variant: Partial<ProductVariant> }
    >({
      query: ({ id, variant }) => ({
        url: `/products/${id}/variants`,
        method: 'POST',
        body: variant,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Product', id }],
    }),
    updateProductVariant: builder.mutation<
      { success: boolean; data: ProductVariant },
      { id: string; variantId: string; variant: Partial<ProductVariant> }
    >({
      query: ({ id, variantId, variant }) => ({
        url: `/products/${id}/variants/${variantId}`,
        method: 'PUT',
        body: variant,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Product', id }],
    }),
    deleteProductVariant: builder.mutation<{ success: boolean; data: ProductVariant }, { id: string; variantId: string }>({
      query: ({ id, variantId }) => ({
        url: `/products/${id}/variants/${variantId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Product', id }],
    }),
    getProductReviews: builder.query<
      {
        success: boolean;
        data: {
          reviews: ProductReview[];
          pagination: { page: number; limit: number; total: number; pages: number };
        };
      },
      { id: string; page?: number; limit?: number; rating?: number }
    >({
      query: ({ id, ...params }) => ({
        url: `/products/${id}/reviews`,
        params,
      }),
      providesTags: (_result, _error, { id }) => [{ type: 'Product', id }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useSearchProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImagesMutation,
  useDeleteProductImageMutation,
  useAddProductVariantMutation,
  useUpdateProductVariantMutation,
  useDeleteProductVariantMutation,
  useGetProductReviewsQuery,
} = productApi;

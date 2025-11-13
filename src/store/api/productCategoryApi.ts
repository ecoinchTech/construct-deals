import { apiSlice } from './apiSlice';
import { ProductCategory, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/product.types';

export const productCategoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductCategories: builder.query<{ success: boolean; data: ProductCategory[] }, void>({
      query: () => '/product-categories',
      providesTags: ['ProductCategory'],
    }),
    getProductCategoryTree: builder.query<{ success: boolean; data: ProductCategory[] }, { status?: string }>({
      query: (params) => ({
        url: '/product-categories/tree',
        params,
      }),
      providesTags: ['ProductCategory'],
    }),
    getProductCategory: builder.query<{ success: boolean; data: ProductCategory }, string>({
      query: (id) => `/product-categories/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'ProductCategory', id }],
    }),
    createProductCategory: builder.mutation<{ success: boolean; data: ProductCategory }, CreateCategoryRequest>({
      query: (body) => ({
        url: '/product-categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ProductCategory'],
    }),
    updateProductCategory: builder.mutation<{ success: boolean; data: ProductCategory }, UpdateCategoryRequest>({
      query: ({ id, ...body }) => ({
        url: `/product-categories/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'ProductCategory', id }, 'ProductCategory'],
    }),
    deleteProductCategory: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/product-categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ProductCategory'],
    }),
    addCategoryAttributes: builder.mutation<{ success: boolean; data: ProductCategory }, { id: string; attributes: any[] }>({
      query: ({ id, attributes }) => ({
        url: `/product-categories/${id}/attributes`,
        method: 'POST',
        body: { attributes },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'ProductCategory', id }, 'ProductCategory'],
    }),
    getCategoryAttributes: builder.query<{ success: boolean; data: any[] }, string>({
      query: (id) => `/product-categories/${id}/attributes`,
      providesTags: (_result, _error, id) => [{ type: 'ProductCategory', id }],
    }),
  }),
});

export const {
  useGetProductCategoriesQuery,
  useGetProductCategoryTreeQuery,
  useGetProductCategoryQuery,
  useCreateProductCategoryMutation,
  useUpdateProductCategoryMutation,
  useDeleteProductCategoryMutation,
  useAddCategoryAttributesMutation,
  useGetCategoryAttributesQuery,
} = productCategoryApi;

import { apiSlice } from './apiSlice';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category.types';

export const categoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategoryTree: builder.query<{ success: boolean; data: { categories: Category[] } }, void>({
      query: () => '/categories/tree',
      providesTags: ['Category'],
    }),
    getCategories: builder.query<{ success: boolean; data: { categories: Category[] } }, void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
    getCategory: builder.query<{ success: boolean; data: { category: Category } }, string>({
      query: (id) => `/categories/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Category', id }],
    }),
    createCategory: builder.mutation<{ success: boolean; data: { category: Category } }, CreateCategoryRequest>({
      query: (body) => ({
        url: '/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation<{ success: boolean; data: { category: Category } }, UpdateCategoryRequest>({
      query: ({ id, ...body }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Category', id }, 'Category'],
    }),
    deleteCategory: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),
  }),
});

export const {
  useGetCategoryTreeQuery,
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;

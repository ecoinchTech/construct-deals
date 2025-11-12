import { apiSlice } from './apiSlice';
import { Document, UploadDocumentRequest, UpdateDocumentRequest, DocumentFilters } from '@/types/document.types';

export const documentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.query<{ documents: Document[]; total: number; page: number; totalPages: number }, DocumentFilters>({
      query: (filters) => ({
        url: '/documents',
        params: filters,
      }),
      providesTags: ['Document'],
    }),
    getDocumentById: builder.query<Document, string>({
      query: (id) => `/documents/${id}`,
      providesTags: ['Document'],
    }),
    uploadDocument: builder.mutation<Document, FormData>({
      query: (formData) => ({
        url: '/documents/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Document'],
    }),
    updateDocument: builder.mutation<Document, UpdateDocumentRequest>({
      query: ({ id, ...data }) => ({
        url: `/documents/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Document'],
    }),
    deleteDocument: builder.mutation<void, string>({
      query: (id) => ({
        url: `/documents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Document'],
    }),
  }),
});

export const {
  useGetDocumentsQuery,
  useGetDocumentByIdQuery,
  useUploadDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
} = documentApi;

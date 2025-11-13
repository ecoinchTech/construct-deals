// src/store/api/tenderDocumentTemplateApi.ts
import { apiSlice } from './apiSlice';
import { TenderTemplate,CreateTemplateRequest,UpdateTemplateRequest,TemplateFilters} from '@/types/template.types';

interface PaginatedTemplateResponse {
  success: boolean;
  data: {
    templates: TenderTemplate[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface TemplateResponse {
  success: boolean;
  data: {
    template: TenderTemplate;
  };
}

export const tenderDocumentTemplateApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTemplates: builder.query<PaginatedTemplateResponse, TemplateFilters>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) queryParams.append(key, String(value));
        });
        return `/tender-document-templates?${queryParams.toString()}`;
      },
      providesTags: ['TenderTemplate'],
    }),
    getTemplate: builder.query<TemplateResponse, string>({
      query: (id) => `/tender-document-templates/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'TenderTemplate', id }],
    }),
    createTemplate: builder.mutation<TemplateResponse, CreateTemplateRequest>({
      query: (body) => ({
        url: '/tender-document-templates',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TenderTemplate'],
    }),
    updateTemplate: builder.mutation<TemplateResponse, UpdateTemplateRequest>({
      query: ({ id, ...body }) => ({
        url: `/tender-document-templates/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'TenderTemplate', id }, 'TenderTemplate'],
    }),
    deleteTemplate: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/tender-document-templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'TenderTemplate', id }, 'TenderTemplate'],
    }),
  }),
});

export const {
  useGetTemplatesQuery,
  useGetTemplateQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
} = tenderDocumentTemplateApi;
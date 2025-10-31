import { apiSlice } from './apiSlice';
import { TenderDocumentTemplate, CreateTemplateRequest } from '@/types/tender-template.types';

export const tenderTemplateApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTenderTemplates: builder.query<{ success: boolean; data: { templates: TenderDocumentTemplate[] } }, void>({
      query: () => '/tender-document-templates',
      providesTags: ['TenderTemplate'],
    }),
    getTenderTemplate: builder.query<{ success: boolean; data: { template: TenderDocumentTemplate } }, string>({
      query: (id) => `/tender-document-templates/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'TenderTemplate', id }],
    }),
    createTenderTemplate: builder.mutation<{ success: boolean; data: { template: TenderDocumentTemplate } }, CreateTemplateRequest>({
      query: (body) => ({
        url: '/tender-document-templates',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TenderTemplate'],
    }),
  }),
});

export const {
  useGetTenderTemplatesQuery,
  useGetTenderTemplateQuery,
  useCreateTenderTemplateMutation,
} = tenderTemplateApi;

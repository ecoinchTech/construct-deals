import { apiSlice } from './apiSlice';
import { Report, GenerateReportRequest, ReportFilters } from '@/types/report.types';

export const reportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReports: builder.query<{ reports: Report[]; total: number; page: number; totalPages: number }, ReportFilters>({
      query: (filters) => ({
        url: '/reports',
        params: filters,
      }),
      providesTags: ['Report'],
    }),
    getReportById: builder.query<Report, string>({
      query: (id) => `/reports/${id}`,
      providesTags: ['Report'],
    }),
    generateReport: builder.mutation<Report, GenerateReportRequest>({
      query: (data) => ({
        url: '/reports/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Report'],
    }),
    deleteReport: builder.mutation<void, string>({
      query: (id) => ({
        url: `/reports/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Report'],
    }),
  }),
});

export const {
  useGetReportsQuery,
  useGetReportByIdQuery,
  useGenerateReportMutation,
  useDeleteReportMutation,
} = reportApi;

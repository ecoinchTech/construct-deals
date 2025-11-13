// src/store/api/dashboardApi.ts

import { apiSlice } from './apiSlice';
import { DashboardData, OrgOwnerDashboard, VendorDashboard, AdminDashboard } from '@/types/dashboard.types';

interface DashboardResponse<T = DashboardData> {
  success: boolean;
  data: T;
}

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardResponse, void>({
      query: () => '/dashboard/stats',
      providesTags: ['RFQ', 'Bid', 'Contract'],
    }),
    getOrgOwnerDashboard: builder.query<DashboardResponse<OrgOwnerDashboard>, void>({
      query: () => '/dashboard/org-owner',
      providesTags: ['RFQ', 'Bid', 'Contract', 'Vendor'],
    }),
    getFacilityManagerDashboard: builder.query<DashboardResponse, void>({
      query: () => '/dashboard/facility-manager',
      providesTags: ['RFQ', 'Bid', 'Contract'],
    }),
    getVendorDashboard: builder.query<DashboardResponse<VendorDashboard>, void>({
      query: () => '/dashboard/vendor',
      providesTags: ['RFQ', 'Bid', 'Contract'],
    }),
    getAdminDashboard: builder.query<DashboardResponse<AdminDashboard>, void>({
      query: () => '/dashboard/admin',
      providesTags: ['User', 'Organization', 'Vendor'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetOrgOwnerDashboardQuery,
  useGetFacilityManagerDashboardQuery,
  useGetVendorDashboardQuery,
  useGetAdminDashboardQuery,
} = dashboardApi;

// src/store/api/contractApi.ts

import { apiSlice } from './apiSlice';
import { Contract, CreateContractRequest, UpdateMilestoneProgressRequest, ApproveMilestoneRequest, RejectMilestoneRequest } from '@/types/contract.types';

interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  total: number;
  pagination: {
    page: number;
    limit: number;
    pages: number;
  };
  data: {
    contracts: T[];
  };
}

export const contractApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getContracts: builder.query<PaginatedResponse<Contract>, { page?: number; limit?: number; status?: string }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) queryParams.append(key, String(value));
        });
        return `/contracts?${queryParams.toString()}`;
      },
      providesTags: ['Contract'],
    }),
    getContract: builder.query<{ success: boolean; data: { contract: Contract } }, string>({
      query: (id) => `/contracts/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Contract', id }],
    }),
    createContract: builder.mutation<{ success: boolean; data: { contract: Contract } }, CreateContractRequest>({
      query: (body) => ({
        url: '/contracts/award',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Contract', 'RFQ', 'Bid'],
    }),
    acceptContract: builder.mutation<{ success: boolean; data: { contract: Contract } }, string>({
      query: (id) => ({
        url: `/contracts/${id}/accept`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Contract', id }, 'Contract'],
    }),
    declineContract: builder.mutation<{ success: boolean; data: { contract: Contract } }, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/contracts/${id}/decline`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Contract', id }, 'Contract'],
    }),
   updateMilestoneProgress: builder.mutation<{ success: boolean; data: { contract: Contract } }, UpdateMilestoneProgressRequest>({
  query: ({ contractId, milestoneId, ...body }) => ({
    url: `/contracts/${contractId}/milestones/${milestoneId}/progress`,
    method: 'POST',
    body,
  }),
  invalidatesTags: (_result, _error, { contractId }) => [{ type: 'Contract', id: contractId }],
}),
   approveMilestone: builder.mutation<{ success: boolean; data: { contract: Contract } }, ApproveMilestoneRequest>({
  query: ({ contractId, milestoneId, comment }) => ({
    url: `/contracts/${contractId}/milestones/${milestoneId}/approve`,
    method: 'POST',
    body: { comment },
  }),
  invalidatesTags: (_result, _error, { contractId }) => [{ type: 'Contract', id: contractId }],
}),
     approveContract: builder.mutation<{ success: boolean; data: { contract: Contract } }, string>({
      query: (id) => ({
        url: `/contracts/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Contract', id }, 'Contract'],
    }),
    rejectMilestone: builder.mutation<{ success: boolean; data: { contract: Contract } }, RejectMilestoneRequest>({
      query: ({ contractId, milestoneId, comment }) => ({
        url: `/contracts/${contractId}/milestones/${milestoneId}/reject`,
        method: 'POST',
        body: { comment },
      }),
      invalidatesTags: (_result, _error, { contractId }) => [{ type: 'Contract', id: contractId }],
    }),
  }),
});

export const {
  useGetContractsQuery,
  useGetContractQuery,
  useCreateContractMutation,
  useAcceptContractMutation,
  useApproveContractMutation,
  useDeclineContractMutation,
  useUpdateMilestoneProgressMutation,
  useApproveMilestoneMutation,
  useRejectMilestoneMutation,
} = contractApi;
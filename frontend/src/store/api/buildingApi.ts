import { apiSlice } from './apiSlice';
import { Building, CreateBuildingRequest, UpdateBuildingRequest } from '@/types/building.types';

interface PaginationParams {
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: {
    buildings: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const buildingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBuildings: builder.query<PaginatedResponse<Building>, PaginationParams>({
      query: ({ page = 1, limit = 10 }) => `/buildings?page=${page}&limit=${limit}`,
      providesTags: ['Building'],
    }),
    getBuilding: builder.query<{ success: boolean; data: { building: Building } }, string>({
      query: (id) => `/buildings/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Building', id }],
    }),
    createBuilding: builder.mutation<{ success: boolean; data: { building: Building } }, CreateBuildingRequest>({
      query: (body) => ({
        url: '/buildings',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Building'],
    }),
    updateBuilding: builder.mutation<{ success: boolean; data: { building: Building } }, UpdateBuildingRequest>({
      query: ({ id, ...body }) => ({
        url: `/buildings/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Building', id }, 'Building'],
    }),
  }),
});

export const {
  useGetBuildingsQuery,
  useGetBuildingQuery,
  useCreateBuildingMutation,
  useUpdateBuildingMutation,
} = buildingApi;

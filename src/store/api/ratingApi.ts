import { apiSlice } from './apiSlice';
import { Rating, CreateRatingRequest } from '@/types/rating.types';

export const ratingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRatings: builder.query<{ success: boolean; data: { ratings: Rating[] } }, { userId?: string; contractId?: string }>({
      query: (params) => {
        if (params.userId) return `/ratings/users/${params.userId}`;
        if (params.contractId) return `/ratings/contracts/${params.contractId}`;
        return '/ratings';
      },
      providesTags: ['Rating'],
    }),
    getRating: builder.query<{ success: boolean; data: { rating: Rating } }, string>({
      query: (id) => `/ratings/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Rating', id }],
    }),
    createRating: builder.mutation<{ success: boolean; data: { rating: Rating } }, CreateRatingRequest>({
      query: (body) => ({
        url: '/ratings',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Rating', 'Contract'],
    }),
  }),
});

export const {
  useGetRatingsQuery,
  useGetRatingQuery,
  useCreateRatingMutation,
} = ratingApi;

import { apiSlice } from './apiSlice';
import { Cart, AddToCartRequest, UpdateCartItemRequest, ApplyCouponRequest } from '@/types/cart.types';

export const cartApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<{ success: boolean; data: Cart }, void>({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation<{ success: boolean; data: Cart }, AddToCartRequest>({
      query: (body) => ({
        url: '/cart',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: builder.mutation<{ success: boolean; data: Cart }, UpdateCartItemRequest>({
      query: ({ itemId, ...body }) => ({
        url: `/cart/${itemId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),
    removeFromCart: builder.mutation<{ success: boolean; data: Cart }, string>({
      query: (itemId) => ({
        url: `/cart/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/cart',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    applyCoupon: builder.mutation<{ success: boolean; data: Cart }, ApplyCouponRequest>({
      query: (body) => ({
        url: '/cart/apply-coupon',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useApplyCouponMutation,
} = cartApi;

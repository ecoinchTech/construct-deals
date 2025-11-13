import { apiSlice } from './apiSlice';
import {
  Order,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  CancelOrderRequest,
  UpdateTrackingRequest,
  OrderQueryParams,
} from '@/types/order.types';

export const orderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<
      {
        success: boolean;
        data: {
          orders: Order[];
          pagination: { page: number; limit: number; total: number; pages: number };
        };
      },
      OrderQueryParams
    >({
      query: (params) => ({
        url: '/orders',
        params,
      }),
      providesTags: ['Order'],
    }),
    getOrder: builder.query<{ success: boolean; data: Order }, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),
    createOrder: builder.mutation<{ success: boolean; data: Order }, CreateOrderRequest>({
      query: (body) => ({
        url: '/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Order', 'Cart'],
    }),
    updateOrderStatus: builder.mutation<{ success: boolean; data: Order }, UpdateOrderStatusRequest>({
      query: ({ orderId, status }) => ({
        url: `/orders/${orderId}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { orderId }) => [{ type: 'Order', id: orderId }, 'Order'],
    }),
    cancelOrder: builder.mutation<{ success: boolean; data: Order }, CancelOrderRequest>({
      query: ({ orderId, reason }) => ({
        url: `/orders/${orderId}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { orderId }) => [{ type: 'Order', id: orderId }, 'Order'],
    }),
    updateTracking: builder.mutation<{ success: boolean; data: Order }, UpdateTrackingRequest>({
      query: ({ orderId, itemId, ...body }) => ({
        url: `/orders/${orderId}/track`,
        method: 'POST',
        body: { itemId, ...body },
      }),
      invalidatesTags: (_result, _error, { orderId }) => [{ type: 'Order', id: orderId }],
    }),
    getTracking: builder.query<{ success: boolean; data: any }, string>({
      query: (orderId) => `/orders/${orderId}/track`,
      providesTags: (_result, _error, orderId) => [{ type: 'Order', id: orderId }],
    }),
    getOrderInvoice: builder.query<{ success: boolean; data: any }, string>({
      query: (orderId) => `/orders/${orderId}/invoice`,
      providesTags: (_result, _error, orderId) => [{ type: 'Order', id: orderId }],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
  useUpdateTrackingMutation,
  useGetTrackingQuery,
  useGetOrderInvoiceQuery,
} = orderApi;

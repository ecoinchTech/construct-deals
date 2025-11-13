import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'https://ecoinch-in-v3-27-10-25-1.onrender.com/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['User', 'Organization', 'Building', 'Vendor', 'Category', 'RFQ', 'Bid', 'Contract', 'Invoice', 'Rating', 'Dispute', 'TenderTemplate', 'PreBidQuery', 'Dashboard', 'Notification', 'Report', 'Payment', 'Document', 'Conversation', 'Message', 'ProductCategory', 'Product', 'VendorProduct', 'Cart', 'Order'],
  endpoints: () => ({}),
});

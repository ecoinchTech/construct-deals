import { apiSlice } from './apiSlice';
import { Conversation, Message, CreateConversationRequest, SendMessageRequest, ConversationFilters } from '@/types/message.types';

export const messageApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query<{ conversations: Conversation[]; total: number; page: number; totalPages: number }, ConversationFilters>({
      query: (filters) => ({
        url: '/conversations',
        params: filters,
      }),
      providesTags: ['Conversation'],
    }),
    getConversationById: builder.query<Conversation, string>({
      query: (id) => `/conversations/${id}`,
      providesTags: ['Conversation'],
    }),
    getMessages: builder.query<{ messages: Message[]; total: number; page: number; totalPages: number }, { conversationId: string; page?: number; limit?: number }>({
      query: ({ conversationId, ...params }) => ({
        url: `/conversations/${conversationId}/messages`,
        params,
      }),
      providesTags: ['Message'],
    }),
    createConversation: builder.mutation<Conversation, CreateConversationRequest>({
      query: (data) => ({
        url: '/conversations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Conversation'],
    }),
    sendMessage: builder.mutation<Message, FormData>({
      query: (formData) => ({
        url: '/messages',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Message', 'Conversation'],
    }),
    markConversationAsRead: builder.mutation<void, string>({
      query: (id) => ({
        url: `/conversations/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Conversation', 'Message'],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetConversationByIdQuery,
  useGetMessagesQuery,
  useCreateConversationMutation,
  useSendMessageMutation,
  useMarkConversationAsReadMutation,
} = messageApi;

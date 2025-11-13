import { apiSlice } from './apiSlice';
import { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth.types';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<{ success: boolean; data: AuthResponse }, RegisterRequest>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
    }),
    login: builder.mutation<{ success: boolean; data: AuthResponse }, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getCurrentUser: builder.query<{ success: boolean; data: { user: AuthResponse['user'] } }, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    logout: builder.mutation<{ success: boolean; message: string }, { refreshToken: string }>({
      query: (body) => ({
        url: '/auth/logout',
        method: 'POST',
        body,
      }),
    }),
    logoutAll: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/auth/logout-all',
        method: 'POST',
      }),
    }),
    forgotPassword: builder.mutation<{ success: boolean; message: string }, { email: string }>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<{ success: boolean; data: AuthResponse }, { resetToken: string; password: string }>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),
    verifyEmail: builder.mutation<{ success: boolean; message: string }, { verificationToken: string }>({
      query: ({ verificationToken }) => ({
        url: `/auth/verify-email/${verificationToken}`,
        method: 'GET',
      }),
    }),
    refreshToken: builder.mutation<{ success: boolean; data: { token: string; refreshToken: string } }, { refreshToken: string }>({
      query: (body) => ({
        url: '/auth/refresh',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
  useLogoutAllMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useRefreshTokenMutation,
} = authApi;

import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosPrivate, axiosInstance } from '../../utils/axios';

// Custom base query using our axios instances
const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: '' }) =>
  async ({ url, method, data, params, isPrivate = true }) => {
    try {
      const axiosToUse = isPrivate ? axiosPrivate : axiosInstance;
      const result = await axiosToUse({ url: baseUrl + url, method, data, params });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/auth' }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        data: credentials,
        isPrivate: false,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/register',
        method: 'POST',
        data: userData,
        isPrivate: false,
      }),
    }),
    logoutUser: builder.mutation({
      query: () => ({
        url: '/logout',
        method: 'POST',
        isPrivate: true,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: '/forgot-password',
        method: 'POST',
        data,
        isPrivate: false,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: '/reset-password',
        method: 'POST',
        data,
        isPrivate: false,
      }),
    }),
    verifyEmail: builder.query({
      query: (token) => ({
        url: `/verify-email?token=${token}`,
        method: 'GET',
        isPrivate: false,
      }),
    }),
    googleLogin: builder.mutation({
      query: (data) => ({
        url: '/google',
        method: 'POST',
        data,
        isPrivate: false,
      }),
    }),
    getMe: builder.query({
      query: () => ({
        url: '/me',
        method: 'GET',
        isPrivate: true,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutUserMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailQuery,
  useGoogleLoginMutation,
  useGetMeQuery,
} = authApi;

import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosPrivate } from '../../utils/axios';

const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: '' }) =>
  async ({ url, method, data, params, headers }) => {
    try {
      const result = await axiosPrivate({
        url: baseUrl + url,
        method,
        data,
        params,
        headers,
      });
      return { data: result.data || result };
    } catch (axiosError) {
      return {
        error: {
          status: axiosError.response?.status,
          data: axiosError.response?.data || axiosError.message,
        },
      };
    }
  };

export const promotionApi = createApi({
  reducerPath: 'promotionApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/promotions' }),
  tagTypes: ['Promotion'],
  endpoints: (builder) => ({
    promoteStudent: builder.mutation({
      query: (data) => ({
        url: '/student',
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: 'Promotion', id: 'LIST' }],
    }),

    promoteBatch: builder.mutation({
      query: (data) => ({
        url: '/batch',
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: 'Promotion', id: 'LIST' }],
    }),

    rollbackPromotion: builder.mutation({
      query: (data) => ({
        url: '/rollback',
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: 'Promotion', id: 'LIST' }],
    }),

    getPromotionHistory: builder.query({
      query: (params) => ({
        url: '/history',
        method: 'GET',
        params,
      }),
      providesTags: [{ type: 'Promotion', id: 'LIST' }],
    }),
  }),
});

export const {
  usePromoteStudentMutation,
  usePromoteBatchMutation,
  useRollbackPromotionMutation,
  useGetPromotionHistoryQuery,
} = promotionApi;

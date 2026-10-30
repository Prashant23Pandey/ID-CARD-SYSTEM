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

export const sessionApi = createApi({
  reducerPath: 'sessionApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/sessions' }),
  tagTypes: ['Session'],
  endpoints: (builder) => ({
    getSessions: builder.query({
      query: (params) => ({
        url: '/',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Session', id: _id })),
              { type: 'Session', id: 'LIST' },
            ]
          : [{ type: 'Session', id: 'LIST' }],
    }),

    getSessionById: builder.query({
      query: (id) => ({
        url: `/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Session', id }],
    }),

    createSession: builder.mutation({
      query: (sessionData) => ({
        url: '/',
        method: 'POST',
        data: sessionData,
      }),
      invalidatesTags: [{ type: 'Session', id: 'LIST' }],
    }),

    updateSession: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Session', id },
        { type: 'Session', id: 'LIST' },
      ],
    }),

    deleteSession: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Session', id: 'LIST' }],
    }),

    activateSession: builder.mutation({
      query: (id) => ({
        url: `/${id}/activate`,
        method: 'PATCH',
      }),
      invalidatesTags: [{ type: 'Session', id: 'LIST' }],
    }),

    archiveSession: builder.mutation({
      query: (id) => ({
        url: `/${id}/archive`,
        method: 'PATCH',
      }),
      invalidatesTags: [{ type: 'Session', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetSessionsQuery,
  useGetSessionByIdQuery,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useDeleteSessionMutation,
  useActivateSessionMutation,
  useArchiveSessionMutation,
} = sessionApi;

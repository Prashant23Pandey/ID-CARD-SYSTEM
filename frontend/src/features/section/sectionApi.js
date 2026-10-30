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

export const sectionApi = createApi({
  reducerPath: 'sectionApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/sections' }),
  tagTypes: ['Section'],
  endpoints: (builder) => ({
    getSections: builder.query({
      query: (params) => ({
        url: '/',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Section', id: _id })),
              { type: 'Section', id: 'LIST' },
            ]
          : [{ type: 'Section', id: 'LIST' }],
    }),

    getSectionById: builder.query({
      query: (id) => ({
        url: `/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Section', id }],
    }),

    createSection: builder.mutation({
      query: (sectionData) => ({
        url: '/',
        method: 'POST',
        data: sectionData,
      }),
      invalidatesTags: [{ type: 'Section', id: 'LIST' }],
    }),

    updateSection: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Section', id },
        { type: 'Section', id: 'LIST' },
      ],
    }),

    deleteSection: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Section', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetSectionsQuery,
  useGetSectionByIdQuery,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
} = sectionApi;

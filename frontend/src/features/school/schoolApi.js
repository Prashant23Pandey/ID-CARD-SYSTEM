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
      return { data: result.data };
    } catch (axiosError) {
      return {
        error: {
          status: axiosError.response?.status,
          data: axiosError.response?.data || axiosError.message,
        },
      };
    }
  };

export const schoolApi = createApi({
  reducerPath: 'schoolApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/schools' }),
  tagTypes: ['School', 'SchoolFilters', 'SchoolStats'],
  endpoints: (builder) => ({
    // ─── GET All Schools (paginated, filtered, searched) ──────
    getSchools: builder.query({
      query: (params) => ({
        url: '/',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'School', id: _id })),
              { type: 'School', id: 'LIST' },
            ]
          : [{ type: 'School', id: 'LIST' }],
    }),

    // ─── GET Single School ────────────────────────────────────
    getSchoolById: builder.query({
      query: (id) => ({
        url: `/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'School', id }],
    }),

    // ─── CREATE School ────────────────────────────────────────
    createSchool: builder.mutation({
      query: (formData) => ({
        url: '/',
        method: 'POST',
        data: formData,
        headers: formData instanceof FormData
          ? { 'Content-Type': 'multipart/form-data' }
          : undefined,
      }),
      invalidatesTags: [{ type: 'School', id: 'LIST' }, { type: 'SchoolStats' }],
    }),

    // ─── UPDATE School ────────────────────────────────────────
    updateSchool: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'School', id },
        { type: 'School', id: 'LIST' },
      ],
    }),

    // ─── DELETE School ────────────────────────────────────────
    deleteSchool: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'School', id: 'LIST' }, { type: 'SchoolStats' }],
    }),

    // ─── UPDATE Status ────────────────────────────────────────
    updateSchoolStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: 'PATCH',
        data: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'School', id },
        { type: 'School', id: 'LIST' },
        { type: 'SchoolStats' },
      ],
    }),

    // ─── Assign Admin ─────────────────────────────────────────
    assignAdmin: builder.mutation({
      query: ({ id, userId }) => ({
        url: `/${id}/assign-admin`,
        method: 'PATCH',
        data: { userId },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'School', id }],
    }),

    // ─── Remove Admin ─────────────────────────────────────────
    removeAdmin: builder.mutation({
      query: ({ id, userId }) => ({
        url: `/${id}/remove-admin`,
        method: 'PATCH',
        data: { userId },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'School', id }],
    }),

    // ─── Upload Logo ──────────────────────────────────────────
    uploadLogo: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/${id}/logo`,
        method: 'POST',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'School', id },
        { type: 'School', id: 'LIST' },
      ],
    }),

    // ─── Delete Logo ──────────────────────────────────────────
    deleteLogo: builder.mutation({
      query: (id) => ({
        url: `/${id}/logo`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'School', id },
        { type: 'School', id: 'LIST' },
      ],
    }),

    // ─── Filter Options ───────────────────────────────────────
    getFilterOptions: builder.query({
      query: () => ({
        url: '/filter-options',
        method: 'GET',
      }),
      providesTags: [{ type: 'SchoolFilters' }],
    }),

    // ─── Statistics ───────────────────────────────────────────
    getSchoolStatistics: builder.query({
      query: () => ({
        url: '/statistics',
        method: 'GET',
      }),
      providesTags: [{ type: 'SchoolStats' }],
    }),
  }),
});

export const {
  useGetSchoolsQuery,
  useGetSchoolByIdQuery,
  useCreateSchoolMutation,
  useUpdateSchoolMutation,
  useDeleteSchoolMutation,
  useUpdateSchoolStatusMutation,
  useAssignAdminMutation,
  useRemoveAdminMutation,
  useUploadLogoMutation,
  useDeleteLogoMutation,
  useGetFilterOptionsQuery,
  useGetSchoolStatisticsQuery,
} = schoolApi;

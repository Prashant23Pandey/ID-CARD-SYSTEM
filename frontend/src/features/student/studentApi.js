import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosPrivate } from '../../utils/axios';

const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: '' }) =>
  async ({ url, method, data, params, headers, responseType }) => {
    try {
      const result = await axiosPrivate({
        url: baseUrl + url,
        method,
        data,
        params,
        headers,
        responseType,
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

export const studentApi = createApi({
  reducerPath: 'studentApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/students' }),
  tagTypes: ['Student', 'StudentStats'],
  endpoints: (builder) => ({
    // ─── GET All Students ──────────────────────────────────────
    getStudents: builder.query({
      query: (params) => ({
        url: '/',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Student', id: _id })),
              { type: 'Student', id: 'LIST' },
            ]
          : [{ type: 'Student', id: 'LIST' }],
    }),

    // ─── GET Single Student ────────────────────────────────────
    getStudentById: builder.query({
      query: (id) => ({
        url: `/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Student', id }],
    }),

    // ─── CREATE Student ────────────────────────────────────────
    createStudent: builder.mutation({
      query: (studentData) => ({
        url: '/',
        method: 'POST',
        data: studentData,
      }),
      invalidatesTags: [{ type: 'Student', id: 'LIST' }],
    }),

    // ─── UPDATE Student ────────────────────────────────────────
    updateStudent: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Student', id },
        { type: 'Student', id: 'LIST' },
      ],
    }),

    // ─── DELETE Student ────────────────────────────────────────
    deleteStudent: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Student', id: 'LIST' }],
    }),

    // ─── Upload Photo ──────────────────────────────────────────
    uploadPhoto: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/${id}/photo`,
        method: 'POST',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Student', id },
        { type: 'Student', id: 'LIST' },
      ],
    }),

    // ─── Bulk Import ───────────────────────────────────────────
    importStudents: builder.mutation({
      query: (formData) => ({
        url: '/import',
        method: 'POST',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
      invalidatesTags: [{ type: 'Student', id: 'LIST' }],
    }),

    // ─── Bulk Export ───────────────────────────────────────────
    // For export, usually we might just use standard Axios or window.location 
    // because RTK query doesn't handle Blob downloads cleanly out of the box.
    // However, we can map it if we handle responseType: 'blob'
    exportStudents: builder.mutation({
      query: (params) => ({
        url: '/export',
        method: 'GET',
        params,
        responseType: 'blob', // crucial for files
      }),
    }),

    // ─── Bulk Promote ──────────────────────────────────────────
    promoteStudents: builder.mutation({
      query: (data) => ({
        url: '/promote',
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: 'Student', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetStudentByIdQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useUploadPhotoMutation,
  useImportStudentsMutation,
  useExportStudentsMutation,
  usePromoteStudentsMutation,
} = studentApi;

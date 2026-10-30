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

export const teacherApi = createApi({
  reducerPath: 'teacherApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/teachers' }),
  tagTypes: ['Teacher', 'TeacherStats'],
  endpoints: (builder) => ({
    getTeachers: builder.query({
      query: (params) => ({ url: '/', method: 'GET', params }),
      providesTags: (result) =>
        result?.data
          ? [...result.data.map(({ _id }) => ({ type: 'Teacher', id: _id })), { type: 'Teacher', id: 'LIST' }]
          : [{ type: 'Teacher', id: 'LIST' }],
    }),
    getTeacherById: builder.query({
      query: (id) => ({ url: `/${id}`, method: 'GET' }),
      providesTags: (result, error, id) => [{ type: 'Teacher', id }],
    }),
    createTeacher: builder.mutation({
      query: (teacherData) => ({ url: '/', method: 'POST', data: teacherData }),
      invalidatesTags: [{ type: 'Teacher', id: 'LIST' }],
    }),
    updateTeacher: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/${id}`, method: 'PUT', data }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Teacher', id }, { type: 'Teacher', id: 'LIST' }],
    }),
    deleteTeacher: builder.mutation({
      query: (id) => ({ url: `/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Teacher', id: 'LIST' }],
    }),
    uploadPhoto: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/${id}/photo`, method: 'POST', data: formData, headers: { 'Content-Type': 'multipart/form-data' },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Teacher', id }, { type: 'Teacher', id: 'LIST' }],
    }),
    uploadSignature: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/${id}/signature`, method: 'POST', data: formData, headers: { 'Content-Type': 'multipart/form-data' },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Teacher', id }, { type: 'Teacher', id: 'LIST' }],
    }),
    assignClass: builder.mutation({
      query: ({ id, classId }) => ({ url: `/${id}/assign-class`, method: 'PATCH', data: { classId } }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Teacher', id }, { type: 'Teacher', id: 'LIST' }],
    }),
    removeClass: builder.mutation({
      query: (id) => ({ url: `/${id}/remove-class`, method: 'PATCH' }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Teacher', id }, { type: 'Teacher', id: 'LIST' }],
    }),
    resetPassword: builder.mutation({
      query: ({ id, newPassword }) => ({ url: `/${id}/reset-password`, method: 'PATCH', data: { newPassword } }),
    }),
    importTeachers: builder.mutation({
      query: (formData) => ({
        url: '/import', method: 'POST', data: formData, headers: { 'Content-Type': 'multipart/form-data' },
      }),
      invalidatesTags: [{ type: 'Teacher', id: 'LIST' }],
    }),
    exportTeachers: builder.mutation({
      query: (params) => ({ url: '/export', method: 'GET', params, responseType: 'blob' }),
    }),
  }),
});

export const {
  useGetTeachersQuery,
  useGetTeacherByIdQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  useUploadPhotoMutation,
  useUploadSignatureMutation,
  useAssignClassMutation,
  useRemoveClassMutation,
  useResetPasswordMutation,
  useImportTeachersMutation,
  useExportTeachersMutation,
} = teacherApi;

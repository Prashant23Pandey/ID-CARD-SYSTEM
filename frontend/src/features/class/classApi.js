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

export const classApi = createApi({
  reducerPath: 'classApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/classes' }),
  tagTypes: ['Class', 'ClassStudents', 'ClassStats'],
  endpoints: (builder) => ({
    getClasses: builder.query({
      query: (params) => ({
        url: '/',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Class', id: _id })),
              { type: 'Class', id: 'LIST' },
            ]
          : [{ type: 'Class', id: 'LIST' }],
    }),

    getClassById: builder.query({
      query: (id) => ({
        url: `/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Class', id }],
    }),

    createClass: builder.mutation({
      query: (classData) => ({
        url: '/',
        method: 'POST',
        data: classData,
      }),
      invalidatesTags: [{ type: 'Class', id: 'LIST' }],
    }),

    updateClass: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Class', id },
        { type: 'Class', id: 'LIST' },
      ],
    }),

    deleteClass: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Class', id: 'LIST' }],
    }),

    assignTeacher: builder.mutation({
      query: ({ classId, teacherId }) => ({
        url: `/${classId}/assign-teacher`,
        method: 'PATCH',
        data: { teacherId },
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: 'Class', id: classId },
        { type: 'Class', id: 'LIST' },
      ],
    }),

    removeTeacher: builder.mutation({
      query: (classId) => ({
        url: `/${classId}/remove-teacher`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, classId) => [
        { type: 'Class', id: classId },
        { type: 'Class', id: 'LIST' },
      ],
    }),

    getClassStudents: builder.query({
      query: ({ classId, sessionId }) => ({
        url: `/${classId}/students`,
        method: 'GET',
        params: { sessionId },
      }),
      providesTags: (result, error, { classId }) => [
        { type: 'ClassStudents', id: classId },
      ],
    }),

    getClassStatistics: builder.query({
      query: (classId) => ({
        url: `/${classId}/statistics`,
        method: 'GET',
      }),
      providesTags: (result, error, classId) => [
        { type: 'ClassStats', id: classId },
      ],
    }),
  }),
});

export const {
  useGetClassesQuery,
  useGetClassByIdQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useAssignTeacherMutation,
  useRemoveTeacherMutation,
  useGetClassStudentsQuery,
  useGetClassStatisticsQuery,
} = classApi;

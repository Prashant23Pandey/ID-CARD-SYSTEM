import { axiosPrivate } from '../utils/axios';

const templateService = {
  list: (params) => axiosPrivate.get('/templates', { params }),
  getById: (id) => axiosPrivate.get(`/templates/${id}`),
  create: (payload) => axiosPrivate.post('/templates', payload),
  update: (id, payload) => axiosPrivate.put(`/templates/${id}`, payload),
  remove: (id) => axiosPrivate.delete(`/templates/${id}`),
  publish: (id) => axiosPrivate.patch('/templates/publish', { id, status: 'PUBLISHED' }),
  archive: (id) => axiosPrivate.patch('/templates/archive', { id, status: 'ARCHIVED' }),
  duplicate: (payload) => axiosPrivate.post('/templates/duplicate', payload),
  versionHistory: (templateId, page = 1, limit = 20) =>
    axiosPrivate.get('/templates/version-history', { params: { templateId, page, limit } }),
  restoreVersion: (payload) => axiosPrivate.post('/templates/restore-version', payload),
  importTemplate: (payload) => axiosPrivate.post('/templates/import', payload),
  exportTemplate: (id) => axiosPrivate.get('/templates/export', { params: { id } }),
};

export default templateService;

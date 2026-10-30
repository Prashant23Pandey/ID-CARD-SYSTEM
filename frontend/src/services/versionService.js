import { axiosPrivate } from '../utils/axios';

const versionService = {
  getHistory: (templateId, page = 1, limit = 20) =>
    axiosPrivate.get('/templates/version-history', { params: { templateId, page, limit } }),
  compare: (templateId, fromVersion, toVersion) =>
    axiosPrivate.get('/templates/compare-versions', { params: { templateId, fromVersion, toVersion } }),
  restore: (templateId, version) => axiosPrivate.post('/templates/restore-version', { templateId, version }),
};

export default versionService;

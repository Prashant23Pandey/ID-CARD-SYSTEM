import { axiosPrivate } from '../utils/axios';

const previewService = {
  previewTemplate: (templateId, data) => axiosPrivate.post(`/templates/${templateId}/preview`, { data }),
};

export default previewService;

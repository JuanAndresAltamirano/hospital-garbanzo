import { apiService } from './apiService';

export const historyService = {
  getAll: async () => {
    const response = await apiService.get('/history');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiService.get(`/history/${id}`);
    return response.data;
  },

  create: async (historyData) => {
    const formData = new FormData();
    Object.keys(historyData).forEach(key => {
      if (key === 'image' && historyData[key]) {
        formData.append('image', historyData[key]);
      } else {
        formData.append(key, historyData[key]);
      }
    });

    const response = await apiService.post('/history', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id, historyData) => {
    const formData = new FormData();
    Object.keys(historyData).forEach(key => {
      if (key === 'image' && historyData[key]) {
        formData.append('image', historyData[key]);
      } else {
        formData.append(key, historyData[key]);
      }
    });

    const response = await apiService.patch(`/history/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id) => {
    await apiService.delete(`/history/${id}`);
  },

  updateOrder: async (orderedIds) => {
    const response = await apiService.patch('/history/reorder', { orderedIds });
    return response.data;
  }
}; 
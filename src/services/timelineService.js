import { apiService } from './apiService';

class TimelineService {
  async getAll() {
    const response = await apiService.get('/history');
    return response.data;
  }

  async getById(id) {
    const response = await apiService.get(`/history/${id}`);
    return response.data;
  }

  async create(formData) {
    const response = await apiService.post('/history', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async update(id, formData) {
    const response = await apiService.patch(`/history/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async delete(id) {
    const response = await apiService.delete(`/history/${id}`);
    return response.data;
  }

  async updateOrder(orderedIds) {
    const response = await apiService.patch('/history/reorder', { orderedIds });
    return response.data;
  }
}

export default new TimelineService(); 
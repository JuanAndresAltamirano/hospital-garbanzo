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
    console.log('Creating timeline with FormData');
    
    // Debug formData
    console.log('FormData contents:');
    for (let pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(`${pair[0]}: File(${pair[1].name}, ${pair[1].type}, ${pair[1].size} bytes)`);
        
        // Check if the file is valid
        if (pair[1].size === 0) {
          console.error('Warning: File has 0 bytes size!');
        }
        
        // Verify the file type is acceptable
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(pair[1].type)) {
          console.warn('Warning: File type may not be accepted by server:', pair[1].type);
        }
      } else {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
    }
    
    try {
      // Debug request headers
      console.log('Sending API request with multipart/form-data content type');
      
      const response = await apiService.post('/history', formData, {
        headers: {
          // Let the browser set the Content-Type with boundary parameter
          'Content-Type': undefined,
          'Accept': 'application/json',
        },
      });
      
      console.log('Create timeline response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in timeline service create:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      }
      throw error;
    }
  }

  async update(id, formData) {
    console.log(`Updating timeline ${id} with FormData`);
    
    // Debug formData
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1] instanceof File ? 
        `File: ${pair[1].name} (${pair[1].type}, ${pair[1].size} bytes)` : 
        pair[1]);
    }
    
    try {
      const response = await apiService.patch(`/history/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Update timeline response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in timeline service update:', error.response?.data || error.message);
      throw error;
    }
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
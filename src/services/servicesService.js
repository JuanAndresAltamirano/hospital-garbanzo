import { apiService } from './apiService';

class ServicesService {
  async getAll() {
    const response = await apiService.get('/services');
    return response.data;
  }

  async getById(id) {
    const response = await apiService.get(`/services/${id}`);
    return response.data;
  }

  async create(formData) {
    // Convert FormData to JSON for the NestJS backend
    const jsonData = {};
    
    // Extract text fields from FormData
    for (const [key, value] of formData.entries()) {
      if (key !== 'image') {
        // Convert string numbers to actual numbers
        if (key === 'price' || key === 'duration') {
          jsonData[key] = parseFloat(value);
        } else {
          jsonData[key] = value;
        }
      }
    }
    
    // Create a new FormData object with the JSON data and image
    const newFormData = new FormData();
    
    // Add the JSON data as a string
    newFormData.append('data', JSON.stringify(jsonData));
    
    // Add the image if it exists
    const imageFile = formData.get('image');
    if (imageFile) {
      newFormData.append('image', imageFile);
    }
    
    const response = await apiService.post('/services', newFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async update(id, formData) {
    // Convert FormData to JSON for the NestJS backend
    const jsonData = {};
    
    // Extract text fields from FormData
    for (const [key, value] of formData.entries()) {
      if (key !== 'image') {
        // Convert string numbers to actual numbers
        if (key === 'price' || key === 'duration') {
          jsonData[key] = parseFloat(value);
        } else {
          jsonData[key] = value;
        }
      }
    }
    
    // Create a new FormData object with the JSON data and image
    const newFormData = new FormData();
    
    // Add the JSON data as a string
    newFormData.append('data', JSON.stringify(jsonData));
    
    // Add the image if it exists
    const imageFile = formData.get('image');
    if (imageFile) {
      newFormData.append('image', imageFile);
    }
    
    const response = await apiService.patch(`/services/${id}`, newFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async delete(id) {
    const response = await apiService.delete(`/services/${id}`);
    return response.data;
  }

  async updateOrder(orderData) {
    const response = await apiService.post('/services/reorder', { orderedIds: orderData.map(item => item.id) });
    return response.data;
  }
}

export const servicesService = new ServicesService(); 
import { apiService } from './apiService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

export const promotionsService = {
  getAll: async () => {
    const response = await apiService.get('/promotions');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiService.get(`/promotions/${id}`);
    return response.data;
  },

  create: async (formData) => {
    console.log('Creating promotion with form data');
    
    // Log form data contents
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value instanceof File ? 'File object' : value}`);
    }
    
    // Directly send the FormData object that was passed in
    const response = await apiService.post('/promotions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        // Remove the default Content-Type from axios instance
        ...(apiService.defaults.headers.common || {})
      },
    });
    return response.data;
  },

  update: async (id, formData) => {
    console.log('Updating promotion with form data');
    
    // Log form data contents
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value instanceof File ? 'File object' : value}`);
    }
    
    // Directly send the FormData object that was passed in
    const response = await apiService.patch(`/promotions/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        // Remove the default Content-Type from axios instance
        ...(apiService.defaults.headers.common || {})
      },
    });
    return response.data;
  },

  delete: async (id) => {
    await apiService.delete(`/promotions/${id}`);
  },

  reorder: async (orderData) => {
    const response = await apiService.patch('/promotions/reorder', { orderData });
    return response.data;
  }
}; 
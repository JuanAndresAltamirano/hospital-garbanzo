import { apiService } from './apiService';

export const galleryService = {
  // Categories endpoints
  getAllCategories: async () => {
    const response = await apiService.get('/gallery/categories');
    return response.data;
  },

  getCategoryById: async (id) => {
    const response = await apiService.get(`/gallery/categories/${id}`);
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await apiService.post('/gallery/categories', categoryData);
    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await apiService.patch(`/gallery/categories/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id) => {
    await apiService.delete(`/gallery/categories/${id}`);
  },

  updateCategoryOrder: async (categoryIds) => {
    const response = await apiService.patch('/gallery/categories/reorder', { categoryIds });
    return response.data;
  },

  // Images endpoints
  getAllImages: async () => {
    const response = await apiService.get('/gallery/images');
    return response.data;
  },

  getImageById: async (id) => {
    const response = await apiService.get(`/gallery/images/${id}`);
    return response.data;
  },

  createImage: async (imageData) => {
    const formData = new FormData();
    
    if (imageData.image) {
      console.log('Adding image file to FormData:', imageData.image.name, imageData.image.type, imageData.image.size);
      formData.append('image', imageData.image);
    } else {
      console.warn('No image file provided');
    }

    if (imageData.alt) {
      formData.append('alt', imageData.alt);
    }

    if (imageData.caption) {
      formData.append('caption', imageData.caption);
    }

    if (imageData.order !== undefined) {
      formData.append('order', imageData.order.toString());
    }

    formData.append('categoryId', Number(imageData.categoryId).toString());

    console.log('Submitting image with categoryId:', imageData.categoryId);
    
    try {
      const response = await apiService.post('/gallery/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Image upload success:', response.data);
      return response.data;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  },

  updateImage: async (id, imageData) => {
    const formData = new FormData();
    
    if (imageData.image) {
      formData.append('image', imageData.image);
    }

    if (imageData.alt !== undefined) {
      formData.append('alt', imageData.alt);
    }

    if (imageData.caption !== undefined) {
      formData.append('caption', imageData.caption);
    }

    if (imageData.order !== undefined) {
      formData.append('order', imageData.order.toString());
    }

    if (imageData.categoryId !== undefined) {
      formData.append('categoryId', Number(imageData.categoryId).toString());
    }

    const response = await apiService.patch(`/gallery/images/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteImage: async (id) => {
    await apiService.delete(`/gallery/images/${id}`);
  },

  updateImageOrder: async (imageIds) => {
    const response = await apiService.patch('/gallery/images/reorder', { imageIds });
    return response.data;
  },

  // Gallery data for Contact page
  getGalleryDataForContact: async () => {
    try {
      const categories = await galleryService.getAllCategories();
      
      const formattedGallery = {
        title: "Galería de Imágenes",
        subtitle: "Conozca nuestras instalaciones y servicios a través de nuestra galería",
        categories: categories.map(category => ({
          id: category.id.toString(),
          name: category.name,
          description: category.description,
          images: category.images.map(image => ({
            id: image.id,
            src: image.src,
            alt: image.alt || '',
            caption: image.caption || ''
          }))
        })),
        getAllImages: function() {
          return this.categories.reduce((allImages, category) => {
            return [...allImages, ...category.images.map(img => ({
              ...img,
              category: category.name
            }))];
          }, []);
        }
      };
      
      return formattedGallery;
    } catch (error) {
      console.error('Error fetching gallery data for contact:', error);
      // Return default gallery data as fallback
      return {
        title: "Galería de Imágenes",
        subtitle: "Conozca nuestras instalaciones y servicios a través de nuestra galería",
        categories: [],
        getAllImages: function() { return []; }
      };
    }
  }
}; 
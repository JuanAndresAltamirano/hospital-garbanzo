import React, { useState, useEffect } from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import Promotion from '../components/Promotion';
import { apiService } from '../services/apiService';
import './Promotions.css';

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  const date = parseISO(dateString);
  return isValid(date) ? format(date, 'dd/MM/yyyy') : 'Fecha inválida';
};

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    discount: '',
    promotionalPrice: '',
    image: null
  });
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [priceType, setPriceType] = useState('discount'); // 'discount' or 'promotionalPrice'

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const response = await apiService.get('/promotions');
      console.log('Promotions data:', response.data);
      // Validate and transform dates before setting state
      const validatedPromotions = response.data.map(promo => ({
        ...promo,
        startDate: promo.startDate || null,
        endDate: promo.endDate || null,
      }));
      setPromotions(validatedPromotions);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error('Error al cargar las promociones');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'El título es requerido';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    
    // Either discount or promotionalPrice should be filled, but not both
    if (!formData.discount && !formData.promotionalPrice) {
      newErrors.discount = 'Debe ingresar un descuento o un precio promocional';
      newErrors.promotionalPrice = 'Debe ingresar un descuento o un precio promocional';
    }
    
    if (!formData.image) newErrors.image = 'La imagen es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    
    if (formData.startDate) {
      formDataToSend.append('startDate', formData.startDate);
    }
    
    if (formData.endDate) {
      formDataToSend.append('endDate', formData.endDate);
    }
    
    // Send discount or promotional price based on what was entered
    if (formData.discount) {
      formDataToSend.append('discount', formData.discount);
      formDataToSend.append('promotionalPrice', '0');
    } else if (formData.promotionalPrice) {
      formDataToSend.append('promotionalPrice', formData.promotionalPrice);
      formDataToSend.append('discount', '0');
    }
    
    formDataToSend.append('image', formData.image);

    try {
      await apiService.post('/promotions', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Promoción creada exitosamente');
      setShowForm(false);
      fetchPromotions();
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        discount: '',
        promotionalPrice: '',
        image: null
      });
    } catch (error) {
      console.error('Error creating promotion:', error);
      toast.error('Error al crear la promoción');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiService.delete(`/promotions/${id}`);
      toast.success('Promoción eliminada exitosamente');
      fetchPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast.error('Error al eliminar la promoción');
    }
  };

  const handleImageError = (e) => {
    e.target.src = '/placeholder-image.jpg';
  };

  if (loading) {
    return <div className="text-center py-8">Cargando promociones...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Promociones</h1>
        <button
          data-testid="create-promotion-button"
          onClick={() => setShowForm(true)}
          className="bg-[cadetblue] text-white px-4 py-2 rounded hover:bg-[#436e70]"
        >
          Nueva Promoción
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Nueva Promoción</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-1">Título</label>
                <input
                  type="text"
                  name="title"
                  data-testid="promotion-title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div className="mb-4">
                <label className="block mb-1">Descripción</label>
                <textarea
                  name="description"
                  data-testid="promotion-description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div className="mb-4">
                <label className="block mb-1">Fecha de inicio</label>
                <input
                  type="date"
                  name="startDate"
                  data-testid="promotion-start-date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
              </div>

              <div className="mb-4">
                <label className="block mb-1">Fecha de fin</label>
                <input
                  type="date"
                  name="endDate"
                  data-testid="promotion-end-date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
                {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
              </div>

              <div className="mb-4">
                <label className="block mb-1">Descuento</label>
                <input
                  type="text"
                  name="discount"
                  data-testid="promotion-discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
                {errors.discount && <p className="text-red-500 text-sm mt-1">{errors.discount}</p>}
              </div>

              <div className="mb-4">
                <label className="block mb-1">Precio promocional</label>
                <input
                  type="text"
                  name="promotionalPrice"
                  data-testid="promotion-promotional-price"
                  value={formData.promotionalPrice}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
                {errors.promotionalPrice && <p className="text-red-500 text-sm mt-1">{errors.promotionalPrice}</p>}
              </div>

              <div className="mb-4">
                <label className="block mb-1">Imagen</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  data-testid="promotion-image"
                  onChange={handleImageChange}
                  className="w-full"
                />
                {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  data-testid="submit-promotion"
                  className="bg-[cadetblue] text-white px-4 py-2 rounded hover:bg-[#436e70]"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {promotions.length === 0 ? (
        <p className="text-center py-8">No hay promociones disponibles en este momento.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map(promotion => (
            <div key={promotion.id} className="promotion-card border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative w-full h-48">
                
                {promotion.image ? (<img
                  src={`${(import.meta.env.VITE_API_URL || 'http://localhost:3001').replace('/api', '')}/uploads/${promotion.image}`}
                  alt={promotion.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />) : (<div className="absolute inset-0 bg-gray-200 flex items-center justify-center hidden">
                  <span className="text-gray-500">Image not available</span>
                </div>)}
              
                
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-lg text-gray-800">{promotion.title}</h3>
                <p className="text-gray-600 line-clamp-2">{promotion.description}</p>
                
                {promotion.discount > 0 && (
                  <p className="text-sm text-red-600 font-medium">
                    Descuento: {promotion.discount}%
                  </p>
                )}
                
                {promotion.promotionalPrice > 0 && (
                  <p className="text-sm text-blue-600 font-medium">
                    Precio promocional: ${parseFloat(promotion.promotionalPrice).toFixed(2)}
                  </p>
                )}
                
                <div className="space-y-1">
                  {promotion.startDate && (<p className="text-sm text-gray-500 flex items-center">
                    <span className="font-medium">Válido desde:</span>
                    <span className="ml-2">{formatDate(promotion.startDate)}</span>
                  </p>)}
                  {promotion.endDate && (<p className="text-sm text-gray-500 flex items-center">
                    <span className="font-medium">Válido hasta:</span>
                    <span className="ml-2">{formatDate(promotion.endDate)}</span>
                  </p>)}  
                </div>
                <button
                  data-testid="delete-promotion"
                  onClick={() => setShowDeleteConfirm(promotion.id)}
                  className="mt-4 text-red-500 hover:text-red-600 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">¿Estás seguro?</h3>
            <p className="mb-4">Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-2">
              <button
                data-testid="cancel-delete"
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                data-testid="confirm-delete"
                onClick={() => handleDelete(showDeleteConfirm)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotions; 
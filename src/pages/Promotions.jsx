import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import Promotion from '../components/Promotion';
import './Promotions.css';

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    validUntil: '',
    image: null
  });
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const response = await axios.get('http://localhost:8000/backend/api/promotions.php');
      setPromotions(response.data);
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
    setFormData(prev => ({
      ...prev,
      image: file
    }));
    // Clear error when user selects a file
    if (errors.image) {
      setErrors(prev => ({
        ...prev,
        image: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'El título es requerido';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    if (!formData.validUntil) newErrors.validUntil = 'La fecha de validez es requerida';
    if (!formData.image) newErrors.image = 'La imagen es requerida';
    
    // Validate date format
    if (formData.validUntil && !/^\d{4}-\d{2}-\d{2}$/.test(formData.validUntil)) {
      newErrors.validUntil = 'La fecha debe estar en formato YYYY-MM-DD';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('validUntil', formData.validUntil);
    formDataToSend.append('image', formData.image);

    try {
      await axios.post('http://localhost:8000/backend/api/promotions.php', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Promoción creada exitosamente');
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        validUntil: '',
        image: null
      });
      fetchPromotions();
    } catch (error) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Error al crear la promoción');
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/backend/api/promotions.php?id=${id}`);
      toast.success('Promoción eliminada exitosamente');
      fetchPromotions();
      setShowDeleteConfirm(null);
    } catch (error) {
      toast.error('Error al eliminar la promoción');
    }
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    const placeholder = e.target.nextElementSibling;
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
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
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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
                <label className="block mb-1">Válido hasta</label>
                <input
                  type="date"
                  name="validUntil"
                  data-testid="promotion-valid-until"
                  value={formData.validUntil}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
                {errors.validUntil && <p className="text-red-500 text-sm mt-1">{errors.validUntil}</p>}
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
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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
            <div key={promotion.id} className="promotion-card border rounded-lg overflow-hidden">
              <div className="relative aspect-video">
                <img
                  src={`http://localhost:8000${promotion.image_url}`}
                  alt={promotion.title}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
                <div className="image-placeholder hidden absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Image not available</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{promotion.title}</h3>
                <p className="text-gray-600 mb-2">{promotion.description}</p>
                <p className="text-sm text-gray-500">
                  Válido hasta: {format(new Date(promotion.valid_until), 'dd/MM/yyyy')}
                </p>
                <button
                  data-testid="delete-promotion"
                  onClick={() => setShowDeleteConfirm(promotion.id)}
                  className="mt-2 text-red-500 hover:text-red-600"
                >
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
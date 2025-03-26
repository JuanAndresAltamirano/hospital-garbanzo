import { useState } from 'react';
import './PromotionForm.css';

const API_URL = 'http://localhost/backend/api';

const PromotionForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    validUntil: '',
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('image', image);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('validUntil', formData.validUntil);

      const response = await fetch(`${API_URL}/promotions.php`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Error al crear la promoción');
      }

      // Reset form
      setFormData({ title: '', description: '', validUntil: '' });
      setImage(null);
      alert('¡Promoción publicada exitosamente!');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error al publicar la promoción:', error);
      alert('Error al publicar la promoción. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="promotion-form" onSubmit={handleSubmit}>
      <h2>Nueva Promoción</h2>
      
      <div className="form-group">
        <label htmlFor="title">Título</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Descripción</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="validUntil">Válido Hasta</label>
        <input
          type="date"
          id="validUntil"
          name="validUntil"
          value={formData.validUntil}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="image">Imagen</label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={handleImageChange}
          required
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Publicando...' : 'Publicar Promoción'}
      </button>
    </form>
  );
};

export default PromotionForm; 
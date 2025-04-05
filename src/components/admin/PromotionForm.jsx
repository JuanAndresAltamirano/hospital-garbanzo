import { useState, useEffect } from 'react';
import './PromotionForm.css';

const PromotionForm = ({ promotion, onSubmit, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discount, setDiscount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (promotion) {
      setTitle(promotion.title);
      setDescription(promotion.description);
      setDiscount(promotion.discount);
      setStartDate(promotion.startDate.split('T')[0]);
      setEndDate(promotion.endDate.split('T')[0]);
      setIsActive(promotion.isActive);
    }
  }, [promotion]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First make a JSON object to convert types correctly
      const data = {
        title,
        description,
        discount: parseInt(discount, 10),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        isActive: isActive === true || isActive === 'true'
      };

      // Now create FormData
      const formData = new FormData();
      
      // Add string fields
      formData.append('title', data.title);
      formData.append('description', data.description);
      
      // Add number fields
      formData.append('discount', data.discount.toString());
      
      // Add date fields - send as ISO string
      formData.append('startDate', data.startDate);
      formData.append('endDate', data.endDate);
      
      // Add boolean field
      formData.append('isActive', data.isActive.toString());
      
      // Add image file if exists
      if (image) {
        formData.append('image', image);
      }
      
      console.log("Form data being submitted:", {
        title: formData.get('title'),
        description: formData.get('description'),
        discount: formData.get('discount'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        isActive: formData.get('isActive'),
        image: image ? image.name : 'No image selected'
      });

      const result = await onSubmit(formData);
      setLoading(false);

      if (result.success) {
        onClose();
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setLoading(false);
      setError(err.message || 'An error occurred while saving the promotion');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="promotion-form">
      <h2>{promotion ? 'Editar Promoción' : 'Nueva Promoción'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="title">Título</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Descripción</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="discount">Descuento (%)</label>
        <input
          type="number"
          id="discount"
          min="0"
          max="100"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="startDate">Fecha de Inicio</label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="endDate">Fecha de Fin</label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="isActive">Estado</label>
        <select
          id="isActive"
          value={isActive}
          onChange={(e) => setIsActive(e.target.value === 'true')}
          disabled={loading}
        >
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="image">Imagen {!promotion && <span className="required">*</span>}</label>
        <input
          type="file"
          id="image"
          accept="image/jpeg,image/png"
          onChange={(e) => setImage(e.target.files[0])}
          disabled={loading}
          required={!promotion}
        />
        {promotion && (
          <small className="help-text">Deja vacío para mantener la imagen actual</small>
        )}
      </div>

      <div className="form-actions">
        <button type="button" onClick={onClose} disabled={loading}>
          Cancelar
        </button>
        <button type="submit" disabled={loading}>
          {loading ? (promotion ? 'Actualizando...' : 'Publicando...') : (promotion ? 'Actualizar' : 'Publicar')}
        </button>
      </div>
    </form>
  );
};

export default PromotionForm; 
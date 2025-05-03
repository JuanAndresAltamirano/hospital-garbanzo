import { useState, useEffect } from 'react';
import './PromotionForm.css';

const PromotionForm = ({ promotion, onSubmit, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' or 'price'
  const [discount, setDiscount] = useState('');
  const [promotionalPrice, setPromotionalPrice] = useState('');
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
      
      // Determine if it's a percentage discount or promotional price
      if (promotion.promotionalPrice) {
        setDiscountType('price');
        setPromotionalPrice(promotion.promotionalPrice);
      } else {
        setDiscountType('percentage');
        setDiscount(promotion.discount || '');
      }
      
      setStartDate(promotion.startDate ? promotion.startDate.split('T')[0] : '');
      setEndDate(promotion.endDate ? promotion.endDate.split('T')[0] : '');
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
        isActive: isActive === true || isActive === 'true'
      };
      
      // Add either discount or promotional price based on selected type
      if (discountType === 'percentage') {
        data.discount = parseInt(discount, 10) || 0;
        data.promotionalPrice = 0;
      } else {
        data.promotionalPrice = parseFloat(promotionalPrice) || 0;
        data.discount = 0;
      }
      
      // Only set dates if they were actually entered
      if (startDate) {
        data.startDate = new Date(startDate).toISOString();
      }
      
      if (endDate) {
        data.endDate = new Date(endDate).toISOString();
      }

      // Now create FormData
      const formData = new FormData();
      
      // Add string fields
      formData.append('title', data.title);
      formData.append('description', data.description);
      
      // Add either discount or promotional price
      if (discountType === 'percentage') {
        formData.append('discount', data.discount.toString());
        formData.append('promotionalPrice', '0');
      } else {
        formData.append('promotionalPrice', data.promotionalPrice.toString());
        formData.append('discount', '0');
      }
      
      // Add dates only if they exist
      if (data.startDate) {
        formData.append('startDate', data.startDate);
      }
      
      if (data.endDate) {
        formData.append('endDate', data.endDate);
      }
      
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
        promotionalPrice: formData.get('promotionalPrice'),
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
        <div className="form-help-text">
          Soporta formato Markdown. Puedes usar **negrita**, *cursiva*, ## títulos, 
          listas con * o 1., [enlaces](https://ejemplo.com), y más.
        </div>
      </div>

      <div className="form-group">
        <label>Tipo de Promoción</label>
        <div className="discount-type-selector">
          <label className="radio-label">
            <input
              type="radio"
              name="discountType"
              value="percentage"
              checked={discountType === 'percentage'}
              onChange={() => setDiscountType('percentage')}
              disabled={loading}
            />
            Descuento (%)
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="discountType"
              value="price"
              checked={discountType === 'price'}
              onChange={() => setDiscountType('price')}
              disabled={loading}
            />
            Precio Promocional ($)
          </label>
        </div>
      </div>

      {discountType === 'percentage' ? (
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
      ) : (
        <div className="form-group">
          <label htmlFor="promotionalPrice">Precio Promocional ($)</label>
          <input
            type="number"
            id="promotionalPrice"
            min="0"
            step="0.01"
            value={promotionalPrice}
            onChange={(e) => setPromotionalPrice(e.target.value)}
            disabled={loading}
            required
          />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="startDate">Fecha de Inicio (usa hoy si está vacío)</label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="endDate">Fecha de Fin (usa un año desde hoy si está vacío)</label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          disabled={loading}
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
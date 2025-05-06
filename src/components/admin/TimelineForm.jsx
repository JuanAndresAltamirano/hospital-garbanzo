import { useState } from 'react';
import './TimelineForm.css';

const TimelineForm = ({ timeline, onSubmit, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [mediaType, setMediaType] = useState(timeline?.videoUrl ? 'video' : 'image');
  const [formData, setFormData] = useState({
    year: timeline?.year || '',
    title: timeline?.title || '',
    description: timeline?.description || '',
    image: null,
    videoUrl: timeline?.videoUrl || '',
  });

  const validateForm = () => {
    const newErrors = {};
    
    // Year validation
    if (!formData.year || formData.year.length !== 4 || isNaN(formData.year)) {
      newErrors.year = 'Year must be a valid 4-digit number';
    }
    
    // Title validation
    if (!formData.title || formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    }
    
    // Description validation
    if (!formData.description || formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    }
    
    // Media validation
    if (mediaType === 'image') {
      // Image validation for new timeline items
      if (!timeline && !formData.image) {
        newErrors.image = 'Image is required for new timeline items when using image type';
      }
    } else if (mediaType === 'video') {
      // Video URL validation
      if (!formData.videoUrl) {
        newErrors.videoUrl = 'Video URL is required when using video type';
      } else if (!isValidUrl(formData.videoUrl)) {
        newErrors.videoUrl = 'Please enter a valid URL';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Create a JSON object with the form data
      const jsonData = {
        year: formData.year,
        title: formData.title,
        description: formData.description,
        videoUrl: mediaType === 'video' ? formData.videoUrl : null,
      };
      
      // Add the JSON data as a string
      formDataToSend.append('data', JSON.stringify(jsonData));
      
      // Only append image if it exists and media type is image
      if (mediaType === 'image' && formData.image) {
        console.log('Appending image to form data:', formData.image.name, formData.image.type, formData.image.size);
        formDataToSend.append('image', formData.image);
      } else {
        console.log('No image to append to form data, using video URL');
      }

      await onSubmit(formDataToSend);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Image selected:', file.name, file.type, file.size);
      
      // Validate file type
      const fileType = file.type;
      if (!['image/jpeg', 'image/png'].includes(fileType)) {
        console.error('Invalid file type:', fileType);
        setErrors(prev => ({
          ...prev,
          image: 'Only JPG and PNG image formats are allowed'
        }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.error('File too large:', file.size);
        setErrors(prev => ({
          ...prev,
          image: 'Image size should not exceed 5MB'
        }));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Clear any previous errors
      setErrors(prev => ({
        ...prev,
        image: null
      }));
    }
  };

  const handleMediaTypeChange = (e) => {
    const newMediaType = e.target.value;
    setMediaType(newMediaType);
    
    // Clear errors related to media when switching types
    setErrors(prev => ({
      ...prev,
      image: null,
      videoUrl: null
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="timeline-form">
      <h2>{timeline ? "Editar Elemento de Historia" : "Agregar Nuevo Elemento"}</h2>

      <div className="form-group">
        <label htmlFor="year">Año <span className="required">*</span></label>
        <input
          type="text"
          id="year"
          value={formData.year}
          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
          disabled={loading}
          required
          maxLength={4}
          pattern="[0-9]{4}"
          placeholder="YYYY"
        />
        {errors.year && <div className="error-message">{errors.year}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="title">Título <span className="required">*</span></label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          disabled={loading}
          required
          minLength={3}
          maxLength={100}
          placeholder="Título del evento"
        />
        {errors.title && <div className="error-message">{errors.title}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Descripción <span className="required">*</span></label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          disabled={loading}
          required
          minLength={10}
          maxLength={1000}
          placeholder="Descripción detallada del evento"
          rows={5}
        />
        {errors.description && <div className="error-message">{errors.description}</div>}
      </div>

      <div className="form-group">
        <label>Tipo de Contenido <span className="required">*</span></label>
        <div className="media-type-selector">
          <div className="radio-option">
            <input
              type="radio"
              id="type-image"
              name="mediaType"
              value="image"
              checked={mediaType === 'image'}
              onChange={handleMediaTypeChange}
              disabled={loading}
            />
            <label htmlFor="type-image">Imagen</label>
          </div>
          <div className="radio-option">
            <input
              type="radio"
              id="type-video"
              name="mediaType"
              value="video"
              checked={mediaType === 'video'}
              onChange={handleMediaTypeChange}
              disabled={loading}
            />
            <label htmlFor="type-video">Video</label>
          </div>
        </div>
      </div>

      {mediaType === 'image' && (
        <div className="form-group">
          <label htmlFor="image" dangerouslySetInnerHTML={{ 
            __html: timeline ? "Imagen (opcional)" : "Imagen <span class='required'>*</span>" 
          }} />
          <input
            type="file"
            id="image"
            onChange={handleImageChange}
            disabled={loading}
            accept="image/jpeg,image/png"
            required={!timeline && mediaType === 'image'}
          />
          <div className="help-text">
            Formatos aceptados: JPG, PNG. Tamaño máximo: 5MB
          </div>
          {errors.image && <div className="error-message">{errors.image}</div>}
        </div>
      )}

      {mediaType === 'video' && (
        <div className="form-group">
          <label htmlFor="videoUrl">
            URL del Video <span className="required">*</span>
          </label>
          <input
            type="url"
            id="videoUrl"
            value={formData.videoUrl}
            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
            disabled={loading}
            required={mediaType === 'video'}
            placeholder="https://www.tiktok.com/@usuario/video/123456789"
          />
          <div className="help-text">
            Ingrese la URL completa del video (TikTok, YouTube, etc.)
          </div>
          {errors.videoUrl && <div className="error-message">{errors.videoUrl}</div>}
        </div>
      )}

      <div className="form-actions">
        <button type="button" onClick={onClose} disabled={loading} className="cancel-button">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Guardando...' : (timeline ? 'Actualizar' : 'Crear')}
        </button>
      </div>
    </form>
  );
};

export default TimelineForm; 
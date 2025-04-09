import { useState } from 'react';
import {
  FaStethoscope,
  FaAmbulance,
  FaFlask,
  FaXRay,
  FaBaby,
  FaFemale,
  FaUserMd,
  FaHospital,
  FaHeartbeat,
  FaBandAid,
  FaPills,
  FaSyringe,
  FaWheelchair,
  FaTeeth,
  FaLungs,
  FaBrain,
  FaEye,
  FaNotesMedical,
  FaClinicMedical,
  FaFirstAid,
  FaVial,
  FaMicroscope,
  FaDna,
  FaBookMedical,
  FaHospitalUser,
  FaUserNurse,
  FaProcedures,
  FaDisease,
  FaVirus,
  FaThermometer,
  FaThList,
  FaGripHorizontal
} from 'react-icons/fa';
import './ServiceForm.css';

const ServiceForm = ({ service, onSubmit, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showGrid, setShowGrid] = useState(false);
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    price: service?.price || '',
    duration: service?.duration || '',
    image: null,
    icon: service?.icon || ''
  });

  const iconOptions = {
    'stethoscope': { icon: <FaStethoscope />, label: 'Medicina General' },
    'ambulance': { icon: <FaAmbulance />, label: 'Servicios de Emergencia' },
    'flask': { icon: <FaFlask />, label: 'Laboratorio' },
    'xray': { icon: <FaXRay />, label: 'Radiología' },
    'baby': { icon: <FaBaby />, label: 'Pediatría' },
    'female': { icon: <FaFemale />, label: 'Ginecología' },
    'doctor': { icon: <FaUserMd />, label: 'Especialistas' },
    'hospital': { icon: <FaHospital />, label: 'Servicios Hospitalarios' },
    'heartbeat': { icon: <FaHeartbeat />, label: 'Cardiología' },
    'bandaid': { icon: <FaBandAid />, label: 'Procedimientos Menores' },
    'pills': { icon: <FaPills />, label: 'Farmacia' },
    'syringe': { icon: <FaSyringe />, label: 'Vacunación' },
    'wheelchair': { icon: <FaWheelchair />, label: 'Terapia Física' },
    'teeth': { icon: <FaTeeth />, label: 'Odontología' },
    'lungs': { icon: <FaLungs />, label: 'Neumología' },
    'brain': { icon: <FaBrain />, label: 'Neurología' },
    'eye': { icon: <FaEye />, label: 'Oftalmología' },
    'notes': { icon: <FaNotesMedical />, label: 'Historial Médico' },
    'clinic': { icon: <FaClinicMedical />, label: 'Consulta Externa' },
    'firstaid': { icon: <FaFirstAid />, label: 'Primeros Auxilios' },
    'vial': { icon: <FaVial />, label: 'Análisis de Sangre' },
    'microscope': { icon: <FaMicroscope />, label: 'Análisis de Laboratorio' },
    'dna': { icon: <FaDna />, label: 'Pruebas Genéticas' },
    'book': { icon: <FaBookMedical />, label: 'Educación Médica' },
    'patient': { icon: <FaHospitalUser />, label: 'Atención al Paciente' },
    'nurse': { icon: <FaUserNurse />, label: 'Enfermería' },
    'bed': { icon: <FaProcedures />, label: 'Hospitalización' },
    'virus': { icon: <FaVirus />, label: 'Enfermedades Infecciosas' },
    'disease': { icon: <FaDisease />, label: 'Enfermedades Generales' },
    'thermometer': { icon: <FaThermometer />, label: 'Clínica de Fiebre' }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }
    
    // Description validation
    if (!formData.description || formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    }
    
    // Price validation
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    // Duration validation
    if (!formData.duration || isNaN(formData.duration) || parseInt(formData.duration) < 1) {
      newErrors.duration = 'Duration must be at least 1 minute';
    }
    
    // Image validation for new services
    if (!service && !formData.image) {
      newErrors.image = 'Image is required for new services';
    }

    // Icon validation
    if (!formData.icon) {
      newErrors.icon = 'Please select an icon';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields to FormData
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('icon', formData.icon);
      
      // Only append image if it exists
      if (formData.image) {
        formDataToSend.append('image', formData.image);
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
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleIconSelect = (iconKey) => {
    setFormData(prev => ({
      ...prev,
      icon: iconKey
    }));
  };

  const renderIconGrid = () => (
    <div className="icon-grid">
      {Object.entries(iconOptions).map(([key, { icon, label }]) => (
        <button
          key={key}
          type="button"
          className={`icon-grid-item ${formData.icon === key ? 'selected' : ''}`}
          onClick={() => handleIconSelect(key)}
          disabled={loading}
        >
          <div className="icon-wrapper">{icon}</div>
          <span className="icon-label">{label}</span>
        </button>
      ))}
    </div>
  );

  const renderIconSelect = () => (
    <div className="icon-select-wrapper">
      <select
        id="icon"
        value={formData.icon}
        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
        disabled={loading}
        required
      >
        <option value="">Seleccionar departamento</option>
        {Object.entries(iconOptions).map(([value, { icon, label }]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {formData.icon && (
        <div className="selected-icon">
          {iconOptions[formData.icon]?.icon}
        </div>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="service-form">
      <h2>{service ? "Editar Servicio" : "Agregar Nuevo Servicio"}</h2>

      <div className="form-group">
        <label htmlFor="name">Nombre <span className="required">*</span></label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={loading}
          required
        />
        {errors.name && <div className="error-message">{errors.name}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Descripción <span className="required">*</span></label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          disabled={loading}
          required
        />
        {errors.description && <div className="error-message">{errors.description}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="price">Precio <span className="required">*</span></label>
        <input
          type="number"
          id="price"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          disabled={loading}
          required
        />
        {errors.price && <div className="error-message">{errors.price}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="duration">Duración (minutos) <span className="required">*</span></label>
        <input
          type="number"
          id="duration"
          min="1"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          disabled={loading}
          required
        />
        {errors.duration && <div className="error-message">{errors.duration}</div>}
      </div>

      <div className="form-group">
        <div className="icon-section-header">
          <label htmlFor="icon">Ícono del Departamento <span className="required">*</span></label>
          <button
            type="button"
            className="view-toggle-btn"
            onClick={() => setShowGrid(!showGrid)}
            disabled={loading}
          >
            {showGrid ? <FaThList /> : <FaGripHorizontal />}
            <span>{showGrid ? 'Vista Lista' : 'Vista Cuadrícula'}</span>
          </button>
        </div>
        {showGrid ? renderIconGrid() : renderIconSelect()}
        {errors.icon && <div className="error-message">{errors.icon}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="image">Imagen {!service && <span className="required">*</span>}</label>
        <input
          type="file"
          id="image"
          accept="image/jpeg,image/png"
          onChange={handleImageChange}
          disabled={loading}
          required={!service}
        />
        {service && (
          <small className="help-text">Deja vacío para mantener la imagen actual</small>
        )}
        {errors.image && <div className="error-message">{errors.image}</div>}
      </div>

      <div className="form-actions">
        <button type="button" onClick={onClose} disabled={loading}>
          Cancelar
        </button>
        <button type="submit" disabled={loading}>
          {loading ? (service ? 'Actualizando...' : 'Creando...') : (service ? 'Actualizar' : 'Crear')}
        </button>
      </div>
    </form>
  );
};

export default ServiceForm; 
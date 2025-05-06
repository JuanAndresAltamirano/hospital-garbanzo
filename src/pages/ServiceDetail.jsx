import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaCalendarAlt, FaClock, FaTag } from 'react-icons/fa';
import { servicesService } from '../services/servicesService';
import './ServiceDetail.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        console.log(`Fetching service with ID: ${id}`);
        const data = await servicesService.getById(id);
        console.log("Service data received:", data);
        setService(data);
      } catch (err) {
        console.error('Error fetching service:', err);
        setError('No pudimos cargar la información del servicio.');
        toast.error('Error al cargar la información del servicio');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchService();
    } else {
      console.error("No service ID provided");
    }
  }, [id]);

  useEffect(() => {
    // Debug render state
    console.log("Component state:", { loading, error, service, id });
  }, [loading, error, service, id]);

  const handleBack = () => {
    navigate('/servicios');
  };

  if (loading) {
    return (
      <div className="service-detail-loading">
        <div className="service-detail-spinner">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" />
          </svg>
        </div>
        <p>Cargando información del servicio...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="service-detail-error">
        <h2>Lo sentimos</h2>
        <p>{error || 'No se encontró el servicio solicitado.'}</p>
        <button className="back-button" onClick={handleBack}>
          <FaArrowLeft /> Volver a servicios
        </button>
      </div>
    );
  }

  // Debug render
  console.log("Rendering service:", service);

  return (
    <div className="service-detail-container">
      <div className="service-detail-header">
        <div className="container">
          <button className="back-button" onClick={handleBack}>
            <FaArrowLeft /> Volver a servicios
          </button>
          <h1>{service.name}</h1>
        </div>
      </div>

      <div className="container">
        <div className="service-detail-content">
          <div className="service-detail-main">
            <div className="service-detail-image">
              {service.image ? (
                <img
                  src={`${API_URL.replace('/api', '')}/uploads/${service.image.split('/').pop()}`}
                  alt={service.name}
                  onError={(e) => {
                    console.error("Image load error:", e);
                    e.target.src = '/placeholder-medical.jpg';
                  }}
                />
              ) : (
                <div className="service-placeholder-image">
                  <span>Imagen no disponible</span>
                </div>
              )}
            </div>

            <div className="service-detail-info">
              <h2>Descripción</h2>
              <p className="service-detail-description">{service.description}</p>
              
              {/* <div className="service-meta">
                {service.price > 0 && (
                  <div className="service-meta-item">
                    <FaTag />
                    <span>Precio desde:</span>
                    <strong>${parseFloat(service.price).toFixed(2)}</strong>
                  </div>
                )}
                
                {service.duration > 0 && (
                  <div className="service-meta-item">
                    <FaClock />
                    <span>Duración aproximada:</span>
                    <strong>{service.duration} minutos</strong>
                  </div>
                )}
              </div> */}
              
             {/* <button className="appointment-button">
                <FaCalendarAlt /> Agendar Cita
              </button> */}
            </div>
          </div>
          
          <div className="service-detail-additional">
            <div className="service-benefits">
              <h3>Beneficios</h3>
              <ul>
                <li>Atención médica con profesionales especializados</li>
                <li>Tecnología de vanguardia para mejores resultados</li>
                <li>Instalaciones modernas y confortables</li>
                <li>Seguimiento personalizado</li>
              </ul>
            </div>
            
            <div className="service-faq">
              <h3>Preguntas Frecuentes</h3>
              <div className="faq-item">
                <h4>¿Necesito preparación previa?</h4>
                <p>Cada servicio puede requerir una preparación específica. Al agendar su cita, nuestro personal le proporcionará toda la información necesaria.</p>
              </div>
           
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA section moved outside container for full width */}
      <div className="service-cta">
        <div className="container">
          <h3>¿Necesita más información?</h3>
          <p>Contáctenos directamente y resolveremos todas sus dudas sobre nuestros servicios de fisioterapia y rehabilitación.</p>
          <div className="cta-buttons">
            <a href="https://wa.me/593967758178?text=Hola%2C%20quisiera%20agendar%20una%20cita" className="contact-button" target="_blank" rel="noopener noreferrer">Agendar Cita</a>
            <a href="tel:+593967758178" className="phone-button">Llamar Ahora</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail; 
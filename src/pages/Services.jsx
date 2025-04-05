import { useState, useEffect } from 'react';
import { FaStethoscope, FaAmbulance, FaFlask, FaXRay, FaBaby, FaFemale } from 'react-icons/fa';
import { apiService } from '../services/apiService';
import { toast } from 'react-toastify';
import './Services.css';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await apiService.get('/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Error al cargar los servicios');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName) => {
    const icons = {
      'stethoscope': <FaStethoscope />,
      'ambulance': <FaAmbulance />,
      'flask': <FaFlask />,
      'xray': <FaXRay />,
      'baby': <FaBaby />,
      'female': <FaFemale />
    };
    return icons[iconName] || <FaStethoscope />;
  };

  if (loading) {
    return (
      <div className="services-page">
        <div className="services-hero">
          <div className="container">
            <h1>Cargando servicios...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="services-page">
      <div className="services-hero">
        <div className="container">
          <h1>Nuestros Servicios</h1>
          <p className="services-intro">
            En Clínica Mullo ofrecemos una amplia gama de servicios médicos con los más altos estándares de calidad.
          </p>
        </div>
      </div>
      
      <div className="container">
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card card">
              <div className="service-icon">
                {getIcon(service.icon)}
              </div>
              <div className="service-image">
                {service.image && (
                  <img
                    src={service.image}
                    alt={service.title}
                    onError={(e) => {
                      e.target.src = './public/uploads/image-not-found.jpg';
                    }}
                  />
                )}
              </div>
              <div className="service-content">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <button className="btn btn-primary service-btn">
                  Más Información
                </button>
              </div>
            </div>
          ))}
        </div>

        <section className="why-choose-us">
          <h2>¿Por qué elegirnos?</h2>
          <div className="features-grid">
            <div className="feature">
              <h4>Experiencia</h4>
              <p>Más de 25 años brindando servicios de salud de calidad.</p>
            </div>
            <div className="feature">
              <h4>Tecnología</h4>
              <p>Equipamiento médico de última generación.</p>
            </div>
            <div className="feature">
              <h4>Profesionales</h4>
              <p>Equipo médico altamente calificado y especializado.</p>
            </div>
            <div className="feature">
              <h4>Atención 24/7</h4>
              <p>Disponibles cuando nos necesites.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Services; 
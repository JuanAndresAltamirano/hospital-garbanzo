import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
  FaCheck
} from 'react-icons/fa';
import { servicesService } from '../services/servicesService';
import './Services.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const servicesRef = useRef(null);
  const navigate = useNavigate();
  
  // Get unique categories from services
  const getCategories = () => {
    const categories = services.map(service => service.category);
    return ['all', ...new Set(categories)].filter(Boolean);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          }
        });
      },
      { threshold: 0.2 }
    );

    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card) => {
      observer.observe(card);
    });

    return () => {
      serviceCards.forEach((card) => {
        observer.unobserve(card);
      });
    };
  }, [services]);

  const fetchServices = async () => {
    try {
      const data = await servicesService.getAll();
      // Sort by name
      const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));
      setServices(sortedData);
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
      'female': <FaFemale />,
      'doctor': <FaUserMd />,
      'hospital': <FaHospital />,
      'heartbeat': <FaHeartbeat />,
      'bandaid': <FaBandAid />,
      'pills': <FaPills />,
      'syringe': <FaSyringe />,
      'wheelchair': <FaWheelchair />,
      'teeth': <FaTeeth />,
      'lungs': <FaLungs />,
      'brain': <FaBrain />,
      'eye': <FaEye />,
      'notes': <FaNotesMedical />,
      'clinic': <FaClinicMedical />,
      'firstaid': <FaFirstAid />,
      'vial': <FaVial />,
      'microscope': <FaMicroscope />,
      'dna': <FaDna />,
      'book': <FaBookMedical />,
      'patient': <FaHospitalUser />,
      'nurse': <FaUserNurse />,
      'bed': <FaProcedures />,
      'virus': <FaVirus />,
      'disease': <FaDisease />,
      'thermometer': <FaThermometer />
    };
    return icons[iconName] || <FaStethoscope />;
  };

  const filteredServices = activeCategory === 'all' 
    ? services 
    : services.filter(service => service.category === activeCategory);

  const handleServiceDetails = (serviceId) => {
    navigate(`/services/${serviceId}`);
  };

  if (loading) {
    return (
      <div className="services-loading">
        <div className="services-spinner">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" />
          </svg>
        </div>
        <p>Cargando nuestros servicios...</p>
      </div>
    );
  }

  return (
    <div className="services-component" ref={servicesRef}>
      <div className="services-hero">
        <div className="container">
          <h1>Nuestros Servicios</h1>
          <p className="services-intro">
            En Hospital Garbanzo ofrecemos una amplia gama de servicios médicos con los más altos estándares de calidad y tecnología de vanguardia para el cuidado integral de su salud.
          </p>
        </div>
      </div>

      <div className="container">
        {services.length === 0 ? (
          <div className="services-empty">
            <div className="services-empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12" y2="16"></line>
              </svg>
            </div>
            <h3>Aún no hay servicios disponibles</h3>
            <p>Pronto publicaremos información sobre nuestros servicios médicos.</p>
          </div>
        ) : (
          <>
            {getCategories().length > 1 && (
              <div className="services-filter">
                {getCategories().map(category => (
                  <button 
                    key={category} 
                    className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category === 'all' ? 'Todos' : category}
                  </button>
                ))}
              </div>
            )}

            <div className="services-grid">
              {filteredServices.map((service) => (
                <div 
                  className="service-card" 
                  key={service.id}
                  data-category={service.category}
                >
                  <div className="service-icon">
                    {getIcon(service.icon)}
                  </div>
                  
                  {service.image && (
                    <div className="service-image">
                      <img
                        src={`${API_URL}/uploads/${service.image}`}
                        alt={service.name}
                        onError={(e) => {
                          e.target.src = '/placeholder-medical.jpg';
                        }}
                        loading="lazy"
                      />
                    </div>
                  )}
                  
                  <div className="service-content">
                    <h3>{service.name}</h3>
                   {/* <p>{service.description}</p> */}
                    
                    <button 
                      className="service-btn"
                      onClick={() => handleServiceDetails(service.id)}
                    >
                      Más Información
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <section className="why-choose-us">
          <h2>¿Por qué elegirnos?</h2>
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">
                <FaUserMd />
              </div>
              <h4>Experiencia Médica</h4>
              <p>Más de 25 años brindando servicios de salud de calidad con profesionales altamente calificados.</p>
            </div>
            
            <div className="feature">
              <div className="feature-icon">
                <FaMicroscope />
              </div>
              <h4>Tecnología Avanzada</h4>
              <p>Equipamiento médico de última generación para diagnósticos precisos y tratamientos efectivos.</p>
            </div>
            
            <div className="feature">
              <div className="feature-icon">
                <FaCheck />
              </div>
              <h4>Calidad Certificada</h4>
              <p>Contamos con certificaciones que avalan la calidad y seguridad de nuestros servicios.</p>
            </div>
            
            <div className="feature">
              <div className="feature-icon">
                <FaAmbulance />
              </div>
              <h4>Atención 24/7</h4>
              <p>Servicio de emergencias disponible las 24 horas del día, los 7 días de la semana.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Services; 
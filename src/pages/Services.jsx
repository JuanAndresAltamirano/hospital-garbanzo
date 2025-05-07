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
  FaCheck,
  FaClock,
  FaTag
} from 'react-icons/fa';
import { servicesService } from '../services/servicesService';
import './Services.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const servicesRef = useRef(null);
  const serviceCardsRef = useRef([]);
  const navigate = useNavigate();
  
  // Get unique categories from services
  const getCategories = () => {
    const categories = services.map(service => service.category);
    return ['all', ...new Set(categories)].filter(Boolean);
  };

  useEffect(() => {
    fetchServices();
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
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

    serviceCardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => {
      serviceCardsRef.current.forEach((card) => {
        if (card) observer.unobserve(card);
      });
    };
  }, [services]);

  const fetchServices = async () => {
    try {
      const data = await servicesService.getAll();
      // Sort by name
      const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));
      setServices(sortedData);
      serviceCardsRef.current = new Array(sortedData.length);
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

  // Format category name with first letter uppercase
  const formatCategoryName = (category) => {
    if (!category) return 'General';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Get human-readable categories
  const getCategoryLabel = (category) => {
    const labels = {
      'all': 'Todos los servicios',
      'consultas': 'Consultas médicas',
      'procedimientos': 'Procedimientos',
      'emergencias': 'Servicios de emergencia',
      'diagnostico': 'Diagnóstico',
      'laboratorio': 'Laboratorio',
      'cirugia': 'Cirugía',
      'especialidades': 'Especialidades'
    };
    
    return labels[category] || formatCategoryName(category);
  };

  const handleServiceDetails = (serviceId) => {
    navigate(`/servicios/${serviceId}`);
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
            En el Centro de Especialidades Médicas Dr. Marco V. Mullo ofrecemos una amplia gama de servicios médicos con los más altos estándares de calidad y tecnología de vanguardia para el cuidado integral de su salud.
          </p>
        </div>
      </div>

      <div className="container">
        {services.length === 0 ? (
          <div className="services-list">
            <h2 className="section-title">Portafolio de Servicios</h2>
            
            <div className="services-grid">
              <div className="service-card" ref={el => serviceCardsRef.current[0] = el}>
                <div className="service-icon">{getIcon('stethoscope')}</div>
                <h3>Medicina General</h3>
                <p>Atención médica integral para el diagnóstico y tratamiento de diversas condiciones de salud.</p>
                <a href="https://wa.me/593967758178?text=Hola%2C%20quisiera%20agendar%20una%20cita%20para%20Medicina%20General" className="btn btn-primary" target="_blank" rel="noopener noreferrer">Agendar Cita</a>
              </div>
              
              <div className="service-card" ref={el => serviceCardsRef.current[1] = el}>
                <div className="service-icon">{getIcon('female')}</div>
                <h3>Obstetricia</h3>
                <p>Atención especializada para el cuidado durante el embarazo, parto y postparto.</p>
                <a href="https://wa.me/593967758178?text=Hola%2C%20quisiera%20agendar%20una%20cita%20para%20Obstetricia" className="btn btn-primary" target="_blank" rel="noopener noreferrer">Agendar Cita</a>
              </div>
              
              <div className="service-card" ref={el => serviceCardsRef.current[2] = el}>
                <div className="service-icon">{getIcon('teeth')}</div>
                <h3>Odontología</h3>
                <p>Servicios dentales completos para mantener la salud bucal y prevenir enfermedades.</p>
                <a href="https://wa.me/593967758178?text=Hola%2C%20quisiera%20agendar%20una%20cita%20para%20Odontología" className="btn btn-primary" target="_blank" rel="noopener noreferrer">Agendar Cita</a>
              </div>
              
              <div className="service-card" ref={el => serviceCardsRef.current[3] = el}>
                <div className="service-icon"><FaTeeth /></div>
                <h3>Endodoncia</h3>
                <p>Tratamiento especializado para problemas del interior del diente y tejidos pulpares.</p>
                <a href="https://wa.me/593967758178?text=Hola%2C%20quisiera%20agendar%20una%20cita%20para%20Endodoncia" className="btn btn-primary" target="_blank" rel="noopener noreferrer">Agendar Cita</a>
              </div>
              
              <div className="service-card" ref={el => serviceCardsRef.current[4] = el}>
                <div className="service-icon"><FaTeeth /></div>
                <h3>Ortodoncia</h3>
                <p>Corrección de la posición de los dientes y mejora de la mordida para una sonrisa saludable.</p>
                <a href="https://wa.me/593967758178?text=Hola%2C%20quisiera%20agendar%20una%20cita%20para%20Ortodoncia" className="btn btn-primary" target="_blank" rel="noopener noreferrer">Agendar Cita</a>
              </div>
              
              <div className="service-card" ref={el => serviceCardsRef.current[5] = el}>
                <div className="service-icon"><FaTeeth /></div>
                <h3>Diseño de sonrisa</h3>
                <p>Procedimientos estéticos para mejorar la apariencia de su sonrisa de manera personalizada.</p>
                <a href="https://wa.me/593967758178?text=Hola%2C%20quisiera%20agendar%20una%20cita%20para%20Diseño%20de%20sonrisa" className="btn btn-primary" target="_blank" rel="noopener noreferrer">Agendar Cita</a>
              </div>
              
              <div className="service-card" ref={el => serviceCardsRef.current[6] = el}>
                <div className="service-icon">{getIcon('baby')}</div>
                <h3>Pediatría</h3>
                <p>Atención médica especializada para niños, desde recién nacidos hasta adolescentes.</p>
                <a href="https://wa.me/593967758178?text=Hola%2C%20quisiera%20agendar%20una%20cita%20para%20Pediatría" className="btn btn-primary" target="_blank" rel="noopener noreferrer">Agendar Cita</a>
              </div>
              
              <div className="service-card" ref={el => serviceCardsRef.current[7] = el}>
                <div className="service-icon">{getIcon('syringe')}</div>
                <h3>Vacunatorio</h3>
                <p>Administración de vacunas para la prevención de enfermedades en niños y adultos.</p>
                <a href="https://wa.me/593967758178?text=Hola%2C%20quisiera%20agendar%20una%20cita%20para%20Vacunatorio" className="btn btn-primary" target="_blank" rel="noopener noreferrer">Agendar Cita</a>
              </div>
              
              <div className="service-card" ref={el => serviceCardsRef.current[8] = el}>
                <div className="service-icon">{getIcon('flask')}</div>
                <h3>Laboratorio clínico</h3>
                <p>Análisis de muestras para diagnóstico y seguimiento de diversas condiciones médicas.</p>
                <a href="https://wa.me/593967758178?text=Hola%2C%20quisiera%20agendar%20una%20cita%20para%20Laboratorio%20clínico" className="btn btn-primary" target="_blank" rel="noopener noreferrer">Agendar Cita</a>
              </div>
              
              <div className="service-card" ref={el => serviceCardsRef.current[9] = el}>
                <div className="service-icon">{getIcon('xray')}</div>
                <h3>Imagenología</h3>
                <p>Técnicas de diagnóstico por imagen para evaluar órganos y estructuras internas.</p>
                <a href="https://wa.me/593967758178?text=Hola%2C%20quisiera%20agendar%20una%20cita%20para%20Imagenología" className="btn btn-primary" target="_blank" rel="noopener noreferrer">Agendar Cita</a>
              </div>
              
              <div className="service-card" ref={el => serviceCardsRef.current[10] = el}>
                <div className="service-icon">{getIcon('wheelchair')}</div>
                <h3>Rehabilitación física</h3>
                <p>Terapias para recuperar la función y movimiento después de lesiones o cirugías.</p>
                <a href="https://wa.me/593967758178?text=Hola%2C%20quisiera%20agendar%20una%20cita%20para%20Rehabilitación%20física" className="btn btn-primary" target="_blank" rel="noopener noreferrer">Agendar Cita</a>
              </div>
              
              <div className="service-card" ref={el => serviceCardsRef.current[11] = el}>
                <div className="service-icon">{getIcon('pills')}</div>
                <h3>Farmacia</h3>
                <p>Dispensación de medicamentos con asesoramiento profesional para su tratamiento.</p>
                <a href="https://wa.me/593967758178?text=Hola%2C%20quisiera%20información%20sobre%20Farmacia" className="btn btn-primary" target="_blank" rel="noopener noreferrer">Agendar Cita</a>
              </div>
              
              <div className="service-card" ref={el => serviceCardsRef.current[12] = el}>
                <div className="service-icon">{getIcon('bandaid')}</div>
                <h3>Traumatología</h3>
                <p>Diagnóstico y tratamiento de lesiones y enfermedades del sistema musculoesquelético.</p>
                <a href="https://wa.me/593967758178?text=Hola%2C%20quisiera%20agendar%20una%20cita%20para%20Traumatología" className="btn btn-primary" target="_blank" rel="noopener noreferrer">Agendar Cita</a>
              </div>
              
              <div className="service-card" ref={el => serviceCardsRef.current[13] = el}>
                <div className="service-icon">{getIcon('notes')}</div>
                <h3>Sala de procedimientos</h3>
                <p>Área especializada para realizar procedimientos médicos menores con todas las medidas de seguridad.</p>
                <a href="https://wa.me/593967758178?text=Hola%2C%20quisiera%20información%20sobre%20Sala%20de%20procedimientos" className="btn btn-primary" target="_blank" rel="noopener noreferrer">Agendar Cita</a>
              </div>
            </div>
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
                    {getCategoryLabel(category)}
                  </button>
                ))}
              </div>
            )}

            <div className="services-grid">
              {filteredServices.map((service, index) => (
                <div 
                  className="service-card" 
                  key={service.id}
                  ref={el => serviceCardsRef.current[index] = el}
                  data-category={service.category}
                  onClick={() => handleServiceDetails(service.id)}
                >
                  {service.image ? (
                    <div className="service-image">
                      <img
                        src={`${API_URL.replace('/api', '')}/uploads/${service.image.split('/').pop()}`}
                        alt={service.name}
                        onError={(e) => {
                          e.target.src = '/placeholder-medical.jpg';
                        }}
                        loading="lazy"
                      />
                      <div className="service-icon">
                        {getIcon(service.icon)}
                      </div>
                    </div>
                  ) : (
                    <div className="service-icon-large">
                      {getIcon(service.icon)}
                    </div>
                  )}
                  
                  <div className="service-content">
                    <h3>{service.name}</h3>
                    <p>{service.description ? service.description.substring(0, 120) + (service.description.length > 120 ? '...' : '') : 'Información detallada disponible al hacer clic.'}</p>
                    
                    <div className="service-meta">
                      {service.category && (
                        <span className="service-category">
                          <FaTag /> {formatCategoryName(service.category)}
                        </span>
                      )}
                    </div>
                    
                    <button className="service-btn">
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
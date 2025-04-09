import { useState, useEffect } from 'react';
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
      'stethoscope': <FaStethoscope />,          // General Medicine/Cardiology
      'ambulance': <FaAmbulance />,              // Emergency Services
      'flask': <FaFlask />,                      // Laboratory
      'xray': <FaXRay />,                        // Radiology
      'baby': <FaBaby />,                        // Pediatrics
      'female': <FaFemale />,                    // Gynecology
      'doctor': <FaUserMd />,                    // Doctors/Specialists
      'hospital': <FaHospital />,                // General Hospital Services
      'heartbeat': <FaHeartbeat />,              // Cardiology
      'bandaid': <FaBandAid />,                  // Minor Procedures/First Aid
      'pills': <FaPills />,                      // Pharmacy
      'syringe': <FaSyringe />,                  // Vaccinations/Injections
      'wheelchair': <FaWheelchair />,            // Physical Therapy/Mobility
      'teeth': <FaTeeth />,                      // Dental
      'lungs': <FaLungs />,                      // Pulmonology
      'brain': <FaBrain />,                      // Neurology
      'eye': <FaEye />,                          // Ophthalmology
      'notes': <FaNotesMedical />,               // Medical Records
      'clinic': <FaClinicMedical />,             // Outpatient Services
      'firstaid': <FaFirstAid />,                // Emergency Care
      'vial': <FaVial />,                        // Blood Tests
      'microscope': <FaMicroscope />,            // Laboratory Analysis
      'dna': <FaDna />,                          // Genetic Testing
      'book': <FaBookMedical />,                 // Medical Education
      'patient': <FaHospitalUser />,             // Patient Care
      'nurse': <FaUserNurse />,                  // Nursing Services
      'bed': <FaProcedures />,                   // Inpatient Services
      'virus': <FaVirus />,                      // Infectious Diseases
      'disease': <FaDisease />,                  // General Diseases
      'thermometer': <FaThermometer />           // Temperature/Fever Clinic
    };
    return icons[iconName] || <FaStethoscope />;
  };

  if (loading) {
    return (
      <div className="services-page">
        <div className="services-hero">
          <div className="container">
            <h1>Nuestros Servicios</h1>
            <div className="loading-banner">Cargando servicios...</div>
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
            En Hospital Garbanzo ofrecemos una amplia gama de servicios médicos con los más altos estándares de calidad y tecnología de vanguardia para el cuidado integral de su salud.
          </p>
        </div>
      </div>
      
      <div className="container">
        <h2 className="section-title">Servicios Médicos Especializados</h2>
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-icon">
                {getIcon(service.icon)}
              </div>
              <div className="service-image">
                {service.image && (
                  <img
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/uploads/${service.image}`}
                    alt={service.name}
                    onError={(e) => {
                      e.target.src = '/placeholder-medical.jpg';
                    }}
                  />
                )}
              </div>
              <div className="service-content">
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <button className="service-btn">
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
              <div className="feature-icon">
                <FaUserMd />
              </div>
              <h4>Experiencia</h4>
              <p>Más de 25 años brindando servicios de salud de calidad con profesionales altamente calificados.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <FaMicroscope />
              </div>
              <h4>Tecnología</h4>
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
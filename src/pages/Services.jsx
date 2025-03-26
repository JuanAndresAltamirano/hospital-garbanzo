import { FaStethoscope, FaAmbulance, FaFlask, FaXRay, FaBaby, FaFemale } from 'react-icons/fa';
import './Services.css';

const Services = () => {
  const services = [
    {
      title: 'Consulta General',
      description: 'Atención médica general para diagnóstico y tratamiento de condiciones comunes.',
      image: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&q=80',
      icon: <FaStethoscope />
    },
    {
      title: 'Emergencias 24/7',
      description: 'Servicio de emergencias disponible las 24 horas, todos los días de la semana.',
      image: 'https://images.unsplash.com/photo-1587746746439-977c9d6be54a?auto=format&fit=crop&q=80',
      icon: <FaAmbulance />
    },
    {
      title: 'Laboratorio Clínico',
      description: 'Análisis clínicos con resultados precisos y rápidos.',
      image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80',
      icon: <FaFlask />
    },
    {
      title: 'Radiología',
      description: 'Servicios de diagnóstico por imagen con tecnología moderna.',
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80',
      icon: <FaXRay />
    },
    {
      title: 'Pediatría',
      description: 'Atención especializada para niños y adolescentes.',
      image: 'https://images.unsplash.com/photo-1666214280533-b9c78f563421?auto=format&fit=crop&q=80',
      icon: <FaBaby />
    },
    {
      title: 'Ginecología',
      description: 'Atención integral para la salud de la mujer.',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80',
      icon: <FaFemale />
    }
  ];

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
          {services.map((service, index) => (
            <div key={index} className="service-card card">
              <div className="service-icon">
                {service.icon}
              </div>
              <div className="service-image">
                <img src={service.image} alt={service.title} />
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
import React, { useState, useEffect } from 'react';
import { FaHospital, FaUserMd, FaAmbulance, FaPhone, FaCalendarCheck, 
         FaHeartbeat, FaStethoscope, FaQuoteLeft, FaChevronRight } from 'react-icons/fa';
import { isValid, parseISO } from 'date-fns';
import PromotionCarousel from '../components/PromotionCarousel';
import { apiService } from '../services/apiService';
import './Home.css';
import { toast } from 'react-toastify';

const Home = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await apiService.get('/promotions');
        console.log('Home promotions data:', response.data);
        // Validate dates and sort by createdAt
        const validatedPromotions = response.data.map(promo => ({
          ...promo,
          startDate: promo.startDate || null,
          endDate: promo.endDate || null,
          createdAt: promo.createdAt || new Date().toISOString()
        }));
        const sortedPromotions = validatedPromotions
          .sort((a, b) => {
            const dateA = parseISO(a.createdAt);
            const dateB = parseISO(b.createdAt);
            return isValid(dateB) && isValid(dateA) ? dateB - dateA : 0;
          });
        setPromotions(sortedPromotions);
      } catch (error) {
        console.error('Error fetching promotions:', error);
        toast.error('Error al cargar las promociones');
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  const testimonials = [
    {
      id: 1,
      name: "María González",
      role: "Paciente",
      text: "El servicio y atención médica que recibí fue excepcional. Los doctores son muy profesionales y las instalaciones modernas y confortables.",
      image: "https://randomuser.me/api/portraits/women/43.jpg"
    },
    {
      id: 2,
      name: "Carlos Ramírez",
      role: "Paciente",
      text: "Mi experiencia con esta clínica ha sido sobresaliente. El diagnóstico fue preciso y el tratamiento efectivo. Recomiendo ampliamente sus servicios.",
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 3,
      name: "Laura Mendoza",
      role: "Paciente",
      text: "Agradezco la atención personalizada y el seguimiento constante a mi caso. El equipo médico es altamente calificado y humano.",
      image: "https://randomuser.me/api/portraits/women/65.jpg"
    }
  ];

  return (
    <div className="home">
      <section className="promotions-section">
        {loading ? (
          <div className="loading-banner">Cargando promociones...</div>
        ) : (
          promotions.length > 0 && <PromotionCarousel promotions={promotions} />
        )}
      </section>

      <section className="hero">
        <div className="hero-content">
          <h1>Su salud es nuestra prioridad</h1>
          <p className="hero-subtitle">Atención médica de calidad con los mejores especialistas</p>
          <div className="hero-buttons">
            <a href="/servicios" className="btn btn-primary">
              Nuestros Servicios <FaChevronRight />
            </a>
            <a href="/contacto" className="btn btn-outline">
              Agendar Cita <FaCalendarCheck />
            </a>
          </div>
        </div>
        <div className="hero-decoration">
          <div className="hero-circle"></div>
          <div className="hero-circle"></div>
        </div>
      </section>

      <section className="highlights">
        <div className="container">
          <h2 className="section-title">Nuestros Servicios Destacados</h2>
          <p className="section-subtitle">Contamos con servicios médicos de alta calidad para el cuidado integral de su salud</p>
          
          <div className="highlights-grid">
            <div className="highlight-card">
              <div className="highlight-icon">
                <FaHospital />
              </div>
              <h3>Instalaciones Modernas</h3>
              <p>Contamos con la última tecnología médica y espacios confortables para su atención.</p>
              <a href="/servicios" className="highlight-link">Conocer más <FaChevronRight /></a>
            </div>
            
            <div className="highlight-card">
              <div className="highlight-icon">
                <FaUserMd />
              </div>
              <h3>Especialistas Calificados</h3>
              <p>Nuestro equipo médico está formado por profesionales altamente capacitados.</p>
              <a href="/especialistas" className="highlight-link">Conocer más <FaChevronRight /></a>
            </div>
            
            <div className="highlight-card">
              <div className="highlight-icon">
                <FaAmbulance />
              </div>
              <h3>Atención de Emergencias</h3>
              <p>Servicio de emergencias disponible las 24 horas, los 7 días de la semana.</p>
              <a href="/servicios" className="highlight-link">Conocer más <FaChevronRight /></a>
            </div>
            
            <div className="highlight-card">
              <div className="highlight-icon">
                <FaHeartbeat />
              </div>
              <h3>Cuidado Preventivo</h3>
              <p>Programas de prevención para mantener su salud en óptimas condiciones.</p>
              <a href="/servicios" className="highlight-link">Conocer más <FaChevronRight /></a>
            </div>
            
            <div className="highlight-card">
              <div className="highlight-icon">
                <FaStethoscope />
              </div>
              <h3>Chequeos Médicos</h3>
              <p>Evaluaciones completas para monitorear su estado de salud general.</p>
              <a href="/servicios" className="highlight-link">Conocer más <FaChevronRight /></a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials section commented out for now
      <section className="testimonials">
        <div className="container">
          <h2 className="section-title">Lo Que Dicen Nuestros Pacientes</h2>
          <div className="testimonials-grid">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="testimonial-card">
                <div className="quote-icon">
                  <FaQuoteLeft />
                </div>
                <p className="testimonial-text">{testimonial.text}</p>
                <div className="testimonial-author">
                  <img src={testimonial.image} alt={testimonial.name} className="testimonial-image" />
                  <div className="testimonial-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      */}

      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>¿Necesita Atención Médica Profesional?</h2>
            <p>Estamos aquí para brindarle la mejor atención. Contáctenos hoy mismo para agendar su cita.</p>
            <div className="cta-buttons">
              <a href="tel:+123456789" className="btn btn-primary">
                <FaPhone /> Llamar Ahora
              </a>
              <a href="/contacto" className="btn btn-outline">
                <FaCalendarCheck /> Agendar Cita
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 
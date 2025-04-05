import React, { useState, useEffect } from 'react';
import { FaHospital, FaUserMd, FaAmbulance } from 'react-icons/fa';
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

  return (
    <div className="home">
      {loading ? (
        <div className="loading-banner">Cargando promociones...</div>
      ) : (
        <PromotionCarousel promotions={promotions} />
      )}

      <section className="highlights">
        <div className="container">
          <div className="highlights-grid">
            <div className="highlight-card">
              <div className="highlight-icon">
                <FaHospital />
              </div>
              <h3>Instalaciones Modernas</h3>
              <p>Contamos con la última tecnología médica y espacios confortables para su atención.</p>
            </div>
            <div className="highlight-card">
              <div className="highlight-icon">
                <FaUserMd />
              </div>
              <h3>Especialistas Calificados</h3>
              <p>Nuestro equipo médico está formado por profesionales altamente capacitados.</p>
            </div>
            <div className="highlight-card">
              <div className="highlight-icon">
                <FaAmbulance />
              </div>
              <h3>Atención de Emergencias</h3>
              <p>Servicio de emergencias disponible las 24 horas, los 7 días de la semana.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>¿Necesita atención médica?</h2>
            <p>Estamos aquí para ayudarle. Contáctenos hoy mismo.</p>
            <a href="tel:+123456789" className="btn btn-primary">
              Llamar Ahora
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 
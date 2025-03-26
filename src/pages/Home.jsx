import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaHospital, FaUserMd, FaAmbulance } from 'react-icons/fa';
import Promotion from '../components/Promotion';
import './Home.css';

const PromotionCard = ({ promotion }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div key={promotion.id} className="promotion-card">
      <img 
        src={`http://localhost:8000${promotion.image_url}`} 
        alt={promotion.title}
        onError={(e) => {
          setImageError(true);
          e.target.style.display = 'none';
        }}
      />
      {imageError && (
        <div className="image-placeholder">
          <FaHospital size={48} />
        </div>
      )}
      <div className="promotion-content">
        <h3>{promotion.title}</h3>
        <p>{promotion.description}</p>
        <p className="valid-until">
          Válido hasta: {new Date(promotion.valid_until).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

const Home = () => {
  const [latestPromotions, setLatestPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestPromotions = async () => {
      try {
        const response = await axios.get('http://localhost:8000/backend/api/promotions.php');
        // Sort by created_at desc and take first 3
        const sortedPromotions = response.data
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 3);
        setLatestPromotions(sortedPromotions);
      } catch (error) {
        console.error('Error fetching promotions:', error);
        setError('Error loading promotions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPromotions();
  }, []);

  if (loading) return <div className="loading">Cargando promociones...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Bienvenidos a Clínica Mullo</h1>
          <p className="hero-subtitle">Su salud es nuestra prioridad</p>
          <div className="hero-buttons">
            <a href="/services" className="btn btn-primary">
              Nuestros Servicios
            </a>
            <a href="/contact" className="btn btn-outline">
              Contáctenos
            </a>
          </div>
        </div>
      </section>

      <section className="featured-services">
        <div className="container">
          <h2>Nuestros Servicios Destacados</h2>
          <div className="services-highlights">
            <div className="highlight-card">
              <div className="highlight-icon">
                <FaUserMd />
              </div>
              <h3>Atención Médica Especializada</h3>
              <p>Contamos con especialistas altamente calificados para brindarle la mejor atención.</p>
            </div>
            <div className="highlight-card">
              <div className="highlight-icon">
                <FaHospital />
              </div>
              <h3>Tecnología de Punta</h3>
              <p>Equipos modernos para diagnósticos precisos y tratamientos efectivos.</p>
            </div>
            <div className="highlight-card">
              <div className="highlight-icon">
                <FaAmbulance />
              </div>
              <h3>Atención de Emergencias</h3>
              <p>Servicio de emergencias 24/7 con personal capacitado.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="promotions-section">
        <h2>Promociones Actuales</h2>
        {latestPromotions.length > 0 ? (
          <div className="promotions-grid">
            {latestPromotions.map(promotion => (
              <PromotionCard key={promotion.id} promotion={promotion} />
            ))}
          </div>
        ) : (
          <p className="no-promotions">No hay promociones disponibles en este momento.</p>
        )}
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
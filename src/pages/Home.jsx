import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FaHospital, FaUserMd, FaAmbulance } from 'react-icons/fa';
import Promotion from '../components/Promotion';
import './Home.css';

const Home = () => {
  const [latestPromotions, setLatestPromotions] = useState([]);

  useEffect(() => {
    const fetchLatestPromotions = async () => {
      const q = query(
        collection(db, 'promotions'),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      
      const querySnapshot = await getDocs(q);
      const promotions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setLatestPromotions(promotions);
    };

    fetchLatestPromotions();
  }, []);

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

      {latestPromotions.length > 0 && (
        <section className="promotions">
          <div className="container">
            <h2>Promociones Actuales</h2>
            <div className="promotions-grid">
              {latestPromotions.map(promotion => (
                <Promotion key={promotion.id} {...promotion} />
              ))}
            </div>
          </div>
        </section>
      )}

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
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaHospital, FaUserMd, FaAmbulance } from 'react-icons/fa';
import Promotion from '../components/Promotion';
import './Home.css';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:8000/backend/uploads';

const PromotionCard = ({ promotion }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = (e) => {
    setImageError(true);
    e.target.style.display = 'none';
  };

  return (
    <div key={promotion.id} className="promotion-card">
      <img 
        src={`${UPLOADS_URL}${promotion.image_url.replace('/uploads', '')}`}
        alt={promotion.title}
        onError={handleImageError}
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
          Válido hasta: {format(new Date(promotion.valid_until), 'dd/MM/yyyy')}
        </p>
      </div>
    </div>
  );
};

const Home = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await axios.get('http://localhost:8000/backend/api/promotions.php');
        // Sort by created_at in descending order and take the latest 3
        const sortedPromotions = response.data
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 3);
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

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    const placeholder = e.target.nextElementSibling;
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  };

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
        {loading ? (
          <div className="text-center py-8">Cargando promociones...</div>
        ) : promotions.length === 0 ? (
          <p className="text-center py-8">No hay promociones disponibles en este momento.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map(promotion => (
              <div key={promotion.id} className="promotion-card border rounded-lg overflow-hidden">
                <div className="relative aspect-video">
                  <img
                    src={`${UPLOADS_URL}${promotion.image_url}`}
                    alt={promotion.title}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                  <div className="image-placeholder hidden absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Image not available</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{promotion.title}</h3>
                  <p className="text-gray-600 mb-2">{promotion.description}</p>
                  <p className="text-sm text-gray-500">
                    Válido hasta: {format(new Date(promotion.valid_until), 'dd/MM/yyyy')}
                  </p>
                </div>
              </div>
            ))}
          </div>
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
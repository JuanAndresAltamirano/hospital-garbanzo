import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaPercentage, FaArrowRight, 
         FaClock, FaTag, FaHospital } from 'react-icons/fa';
import { format, isValid, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import './PromotionCarousel.css';

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  const date = parseISO(dateString);
  return isValid(date) ? format(date, 'dd MMMM yyyy', { locale: es }) : 'Fecha inválida';
};

const getRemainingDays = (endDateString) => {
  if (!endDateString) return null;
  
  const endDate = parseISO(endDateString);
  if (!isValid(endDate)) return null;

  const today = new Date();
  const remainingDays = differenceInDays(endDate, today);
  
  return remainingDays >= 0 ? remainingDays : null;
};

const PromotionCarousel = ({ promotions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === promotions.length - 1 ? 0 : prevIndex + 1
      );
    }, 7000); // Change slide every 7 seconds

    return () => clearInterval(timer);
  }, [promotions.length]);

  const goToSlide = (index) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500); // Match transition duration
  };

  const goToPrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? promotions.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === promotions.length - 1 ? 0 : prevIndex + 1
    );
    setTimeout(() => setIsAnimating(false), 500);
  };

  if (!promotions || promotions.length === 0) {
    return null;
  }

  return (
    <section className="health-promotions-section">
      <div className="decoration-left"></div>
      <div className="decoration-right"></div>
      <h2 className="section-title">Promociones de Salud</h2>
      <div className="promotion-carousel">
        <div className="carousel-container">
          <div 
            className="carousel-track"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {promotions.map((promotion, index) => {
              const remainingDays = getRemainingDays(promotion.endDate);
              
              return (
                <div key={promotion.id} className="carousel-slide">
                  <div className={`promotion-card ${index === currentIndex ? 'active' : ''}`}>
                    <div className="promotion-card-inner">
                      <div className="promotion-card-content">
                        <div className="promotion-label">
                          <FaTag />
                          <span>Promoción Especial</span>
                        </div>
                        
                        <div className="promotion-header">
                          <h3>{promotion.title}</h3>
                          {promotion.discount && (
                            <div className="discount-badge">
                              <FaPercentage /> {promotion.discount}% descuento
                            </div>
                          )}
                        </div>
                        
                        <p className="promotion-description">{promotion.description}</p>
                        
                        {remainingDays !== null && remainingDays <= 7 && (
                          <div className="expiring-soon">
                            <FaClock />
                            <span>¡Termina pronto! Solo {remainingDays} {remainingDays === 1 ? 'día' : 'días'} restantes</span>
                          </div>
                        )}
                        
                        <div className="promotion-dates">
                          <div className="date-item">
                            <FaCalendarAlt />
                            <span>Desde: {formatDate(promotion.startDate)}</span>
                          </div>
                          <div className="date-item">
                            <FaCalendarAlt />
                            <span>Hasta: {formatDate(promotion.endDate)}</span>
                          </div>
                          <div className="date-item service-item">
                            <FaHospital />
                            <span>Servicio: {promotion.service || 'Consulta general'}</span>
                          </div>
                        </div>
                        
                        <button className="learn-more-btn">
                          Más Información <FaArrowRight />
                        </button>
                      </div>
                      <div className="promotion-image">
                        <img 
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/uploads/${promotion.image}`}
                          alt={promotion.title}
                          onError={(e) => {
                            e.target.src = 'https://cdn.pixabay.com/photo/2014/06/03/19/38/board-361516_1280.jpg';
                          }}
                        />
                        {promotion.discount && (
                          <div className="corner-ribbon">
                            {promotion.discount}% OFF
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <button className="carousel-button prev" onClick={goToPrevious} aria-label="Promoción anterior" disabled={isAnimating}>
          <FaChevronLeft />
        </button>
        <button className="carousel-button next" onClick={goToNext} aria-label="Promoción siguiente" disabled={isAnimating}>
          <FaChevronRight />
        </button>
        
        <div className="carousel-navigation">
          <div className="carousel-dots">
            {promotions.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Ir a promoción ${index + 1}`}
                disabled={isAnimating}
              />
            ))}
          </div>
          
          <div className="slide-progress">
            <div 
              className="progress-bar" 
              style={{ 
                width: `${(100 / promotions.length) * (currentIndex + 1)}%`
              }}
            ></div>
          </div>
          
          <div className="slide-counter">
            <span className="current">{currentIndex + 1}</span>
            <span className="separator">/</span>
            <span className="total">{promotions.length}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

PromotionCarousel.propTypes = {
  promotions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      startDate: PropTypes.string.isRequired,
      endDate: PropTypes.string.isRequired,
      discount: PropTypes.number,
      service: PropTypes.string
    })
  ).isRequired
};

export default PromotionCarousel; 
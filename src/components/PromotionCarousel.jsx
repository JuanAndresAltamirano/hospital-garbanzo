import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaPercentage, FaArrowRight, 
         FaClock, FaTag, FaHospital } from 'react-icons/fa';
import { format, isValid, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import './PromotionCarousel.css';

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  try {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, 'dd MMMM yyyy', { locale: es }) : 'Fecha inválida';
  } catch (error) {
    return 'Fecha inválida';
  }
};

const getRemainingDays = (endDateString) => {
  if (!endDateString) return null;
  
  try {
    const endDate = parseISO(endDateString);
    if (!isValid(endDate)) return null;

    const today = new Date();
    const remainingDays = differenceInDays(endDate, today);
    
    return remainingDays >= 0 ? remainingDays : null;
  } catch (error) {
    return null;
  }
};

const formatDescription = (description) => {
  if (!description) return null;
  
  return (
    <div className="markdown-content">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeRaw]}
      >
        {description}
      </ReactMarkdown>
    </div>
  );
};

const isDefaultDate = (dateString, promotion) => {
  if (!dateString) return true;
  
  try {
    const date = new Date(dateString);
    const createdAt = new Date(promotion.createdAt);
    
    // If it's the same day as creation or exactly one year later, it's likely default
    if (date.toDateString() === createdAt.toDateString()) {
      return true;
    }
    
    const oneYearLater = new Date(createdAt);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    
    if (date.toDateString() === oneYearLater.toDateString()) {
      return true;
    }
    
    return false;
  } catch (error) {
    return true;
  }
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
                  <div className="promotion-card-inner">
                    <div className="promotion-card-content">
                      <div className="promotion-label">
                        <FaTag />
                        <span>Promoción Especial</span>
                      </div>
                      
                      <div className="promotion-header">
                        <h3>{promotion.title}</h3>
                      </div>
                      
                      {(promotion.discount > 0 || promotion.promotionalPrice > 0) && (
                        <div className={`discount-badge ${promotion.promotionalPrice > 0 ? 'price-badge' : ''}`}>
                          {promotion.discount > 0 ? (
                            <>
                              <FaPercentage />
                              <span>¡{Math.round(promotion.discount)}% de descuento!</span>
                            </>
                          ) : promotion.promotionalPrice > 0 ? (
                            <>
                              <span className="price-icon">$</span>
                              <span>¡Precio promocional: ${parseFloat(promotion.promotionalPrice).toFixed(2)}!</span>
                            </>
                          ) : null}
                        </div>
                      )}
                      
                      <div className="promotion-description">
                        {formatDescription(promotion.description)}
                      </div>
                      
                      {remainingDays !== null && remainingDays <= 7 && (
                        <div className="expiring-soon">
                          <FaClock />
                          <span>¡Termina pronto! Solo {remainingDays} {remainingDays === 1 ? 'día' : 'días'} restantes</span>
                        </div>
                      )}
                      
                      {(promotion.startDate || promotion.endDate || promotion.service) && (
                        <div className="promotion-dates">
                          {promotion.startDate && (
                            <div className="date-item">
                              <FaCalendarAlt />
                              <span>Desde: {formatDate(promotion.startDate)}</span>
                            </div>
                          )}
                          {promotion.endDate && (
                            <div className="date-item">
                              <FaCalendarAlt />
                              <span>Hasta: {formatDate(promotion.endDate)}</span>
                            </div>
                          )}
                          {promotion.service && (
                            <div className="date-item service-item">
                              <FaHospital />
                              <span>Servicio: {promotion.service}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <button className="learn-more-btn">
                        Más Información <FaArrowRight />
                      </button>
                    </div>
                    <div className="promotion-image">
                      <img 
                        src={promotion.image ? `${(import.meta.env.VITE_API_URL || 'http://localhost:3001').replace('/api', '')}/uploads/${promotion.image}` : 'https://cdn.pixabay.com/photo/2014/06/03/19/38/board-361516_1280.jpg'}
                        alt={promotion.title}
                        onError={(e) => {
                          e.target.src = 'https://cdn.pixabay.com/photo/2014/06/03/19/38/board-361516_1280.jpg';
                        }}
                      />
              
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
      hasDefaultDates: PropTypes.bool,
      isStartDateDefault: PropTypes.bool,
      isEndDateDefault: PropTypes.bool,
      discount: PropTypes.number,
      promotionalPrice: PropTypes.number,
      service: PropTypes.string
    })
  ).isRequired
};

export default PromotionCarousel; 
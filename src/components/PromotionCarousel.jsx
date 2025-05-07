import React, { useState, useEffect, useRef, useCallback } from 'react';
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

// Helper function to get optimized image URL
const getOptimizedImageUrl = (imagePath, format = 'webp') => {
  if (!imagePath) return 'https://cdn.pixabay.com/photo/2014/06/03/19/38/board-361516_1280.jpg';
  
  // For already external URLs
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // For internal images from our backend
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace('/api', '');
  return `${baseUrl}/uploads/${imagePath}?format=${format}`;
};

const PromotionCarousel = ({ promotions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const autoPlayRef = useRef(null);
  const carouselRef = useRef(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;
  
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
    
    // Reset values
    setTouchStart(null);
    setTouchEnd(null);
  };

  const goToSlide = useCallback((index) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500); // Match transition duration
  }, [isAnimating]);

  const goToPrevious = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? promotions.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, promotions.length]);

  const goToNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === promotions.length - 1 ? 0 : prevIndex + 1
    );
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, promotions.length]);
  
  // Manage autoplay with useRef to avoid dependencies
  useEffect(() => {
    autoPlayRef.current = () => {
      if (!isAnimating && promotions.length > 1) {
        setCurrentIndex((prevIndex) => 
          prevIndex === promotions.length - 1 ? 0 : prevIndex + 1
        );
      }
    };
  }, [isAnimating, promotions.length]);

  // Setup interval for autoplay
  useEffect(() => {
    // Skip autoplay if there's only one promotion
    if (promotions.length <= 1) return;
    
    const play = () => {
      autoPlayRef.current();
    };
    
    const interval = setInterval(play, 7000);
    
    return () => {
      clearInterval(interval);
    };
  }, [promotions.length]);

  // Handle keyboard navigation
  useEffect(() => {
    // Skip keyboard navigation if there's only one promotion
    if (promotions.length <= 1) return;
    
    const handleKeyDown = (e) => {
      if (document.activeElement === carouselRef.current || carouselRef.current.contains(document.activeElement)) {
        if (e.key === 'ArrowLeft') {
          goToPrevious();
        } else if (e.key === 'ArrowRight') {
          goToNext();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNext, goToPrevious, promotions.length]);
  
  const handleMoreInfoClick = (e, promotionId) => {
    e.stopPropagation(); // Prevent event bubbling
    window.open(`/promociones/${promotionId}`, '_blank');
  };

  if (!promotions || promotions.length === 0) {
    return null;
  }

  return (
    <section className="health-promotions-section">
      <div className="decoration-left" aria-hidden="true"></div>
      <div className="decoration-right" aria-hidden="true"></div>
      <div 
        className="promotion-carousel" 
        ref={carouselRef}
        tabIndex="0"
        aria-label="Carrusel de promociones"
        role="region"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="carousel-container">
          <div 
            className="carousel-track"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {promotions.map((promotion, index) => {
              const remainingDays = getRemainingDays(promotion.endDate);
              
              return (
                <div 
                  key={promotion.id} 
                  className="carousel-slide" 
                  aria-hidden={currentIndex !== index}
                  aria-roledescription="slide"
                >
                  <div className="promotion-card-inner">
                    <div className="promotion-card-content">
                      <div className="promotion-label">
                        <FaTag aria-hidden="true" />
                        <span>Promoción Especial</span>
                      </div>
                      
                      {(promotion.discount > 0 || promotion.promotionalPrice > 0) && (
                        <div className={`discount-badge ${promotion.promotionalPrice > 0 ? 'price-badge' : ''}`}>
                          {promotion.discount > 0 ? (
                            <>
                              <FaPercentage aria-hidden="true" />
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
                      
                      <div className="promotion-header">
                        <h3>{promotion.title}</h3>
                      </div>
                      
                      <div className="promotion-description">
                        {formatDescription(promotion.description)}
                      </div>
                      
                      {remainingDays !== null && remainingDays <= 7 && (
                        <div className="expiring-soon">
                          <FaClock aria-hidden="true" />
                          <span>¡Termina pronto! Solo {remainingDays} {remainingDays === 1 ? 'día' : 'días'} restantes</span>
                        </div>
                      )}
                      
                      {(promotion.startDate || promotion.endDate || promotion.service) && (
                        <div className="promotion-dates">
                          {promotion.startDate && (
                            <div className="date-item">
                              <FaCalendarAlt aria-hidden="true" />
                              <span>Desde: {formatDate(promotion.startDate)}</span>
                            </div>
                          )}
                          {promotion.endDate && (
                            <div className="date-item">
                              <FaCalendarAlt aria-hidden="true" />
                              <span>Hasta: {formatDate(promotion.endDate)}</span>
                            </div>
                          )}
                          {promotion.service && (
                            <div className="date-item service-item">
                              <FaHospital aria-hidden="true" />
                              <span>Servicio: {promotion.service}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="promotion-button-wrapper">
                        <a 
                          href={`https://wa.me/593967758178?text=Hola%2C%20quisiera%20informacion%20sobre%20la%20promocion%20${encodeURIComponent(promotion.title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="promotion-button"
                        >
                          Más Información <FaArrowRight aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                    <div className="promotion-image">
                      {promotion.image ? (
                        <picture>
                          <source 
                            srcSet={getOptimizedImageUrl(promotion.image, 'webp')} 
                            type="image/webp" 
                          />
                          <source 
                            srcSet={getOptimizedImageUrl(promotion.image, 'jpg')} 
                            type="image/jpeg" 
                          />
                          <img 
                            src={`${(import.meta.env.VITE_API_URL || 'http://localhost:3001').replace('/api', '')}/uploads/${promotion.image}`}
                            alt={promotion.title}
                            onError={(e) => {
                              e.target.src = 'https://cdn.pixabay.com/photo/2014/06/03/19/38/board-361516_1280.jpg';
                            }}
                          />
                        </picture>
                      ) : (
                        <img 
                          src="https://cdn.pixabay.com/photo/2014/06/03/19/38/board-361516_1280.jpg"
                          alt={promotion.title}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {promotions.length > 1 && (
          <>
            <button 
              className="carousel-button prev" 
              onClick={goToPrevious} 
              aria-label="Promoción anterior" 
              disabled={isAnimating}
            >
              <FaChevronLeft aria-hidden="true" />
            </button>
            <button 
              className="carousel-button next" 
              onClick={goToNext} 
              aria-label="Promoción siguiente" 
              disabled={isAnimating}
            >
              <FaChevronRight aria-hidden="true" />
            </button>
          </>
        )}
        
        {promotions.length > 1 && (
          <div className="carousel-dots" role="tablist" aria-label="Puntos de navegación">
            {promotions.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Ir a promoción ${index + 1}`}
                role="tab"
                aria-selected={index === currentIndex}
                disabled={isAnimating}
                tabIndex={index === currentIndex ? 0 : -1}
              />
            ))}
          </div>
        )}
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
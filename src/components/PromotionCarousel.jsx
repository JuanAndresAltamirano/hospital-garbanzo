import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { format, isValid, parseISO } from 'date-fns';
import './PromotionCarousel.css';

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  const date = parseISO(dateString);
  return isValid(date) ? format(date, 'dd/MM/yyyy') : 'Fecha inválida';
};

const PromotionCarousel = ({ promotions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === promotions.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [promotions.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? promotions.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === promotions.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (!promotions || promotions.length === 0) {
    return null;
  }

  return (
    <div className="promotion-carousel">
      <div className="carousel-container">
        <div 
          className="carousel-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {promotions.map((promotion, index) => (
            <div key={promotion.id} className="carousel-slide">
              <img 
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/uploads/${promotion.image.split('/').pop()}`}
                alt={promotion.title}
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
              <div className="carousel-content">
                <h2>{promotion.title}</h2>
                <p>{promotion.description}</p>
                <div className="promotion-dates">
                  <span>Válido desde: {formatDate(promotion.startDate)}</span>
                  <span>Hasta: {formatDate(promotion.endDate)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button className="carousel-button prev" onClick={goToPrevious}>
        <FaChevronLeft />
      </button>
      <button className="carousel-button next" onClick={goToNext}>
        <FaChevronRight />
      </button>
      <div className="carousel-dots">
        {promotions.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
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
      endDate: PropTypes.string.isRequired
    })
  ).isRequired
};

export default PromotionCarousel; 
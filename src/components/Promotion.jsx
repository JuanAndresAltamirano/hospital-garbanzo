import PropTypes from 'prop-types';
import { FaCalendarAlt, FaArrowRight, FaTag, FaHospital } from 'react-icons/fa';
import { format, isValid, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import './Promotion.css';

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  const date = parseISO(dateString);
  return isValid(date) ? format(date, 'dd MMMM yyyy', { locale: es }) : 'Fecha inválida';
};

const Promotion = ({ title, description, imageUrl, validUntil, discount, service }) => {
  return (
    <div className="promotion-card">
      <div className="promotion-image">
        <img src={imageUrl} alt={title} />
        {discount && (
          <div className="discount-badge">
            {discount}% OFF
          </div>
        )}
      </div>
      <div className="promotion-content">
        <div className="promotion-label">
          <FaTag />
          <span>Promoción Especial</span>
        </div>
        
        <h3>{title}</h3>
        <p>{description}</p>
        
        <div className="promotion-details">
          {validUntil && (
            <div className="date-item">
              <FaCalendarAlt />
              <span>Válido hasta: {formatDate(validUntil)}</span>
            </div>
          )}
          
          {service && (
            <div className="date-item service-item">
              <FaHospital />
              <span>{service}</span>
            </div>
          )}
        </div>
        
        <button className="learn-more-btn">
          Ver más <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

Promotion.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
  validUntil: PropTypes.string,
  discount: PropTypes.number,
  service: PropTypes.string
};

export default Promotion; 
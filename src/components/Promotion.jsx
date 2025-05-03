import PropTypes from 'prop-types';
import { FaCalendarAlt, FaArrowRight, FaTag, FaHospital } from 'react-icons/fa';
import { format, isValid, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import './Promotion.css';

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  const date = parseISO(dateString);
  return isValid(date) ? format(date, 'dd MMMM yyyy', { locale: es }) : 'Fecha inválida';
};

const Promotion = ({ title, description, imageUrl, validUntil, discount, promotionalPrice, service }) => {
  return (
    <div className="promotion-card">
      <div className="promotion-image">
        <img src={imageUrl} alt={title} />
        {discount > 0 ? (
          <div className="discount-badge">
            {discount}% OFF
          </div>
        ) : promotionalPrice > 0 ? (
          <div className="discount-badge price-badge">
            <span className="price-icon">$</span>
            <span>${parseFloat(promotionalPrice).toFixed(2)}</span>
          </div>
        ) : null}
      </div>
      <div className="promotion-content">
        <div className="promotion-label">
          <FaTag />
          <span>Promoción Especial</span>
        </div>
        
        <h3>{title}</h3>
        <div className="promotion-description">
          <div className="markdown-content">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw]}
            >
              {description}
            </ReactMarkdown>
          </div>
        </div>
        
        {(validUntil || service) && (
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
        )}
        
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
  promotionalPrice: PropTypes.number,
  service: PropTypes.string
};

export default Promotion; 
import PropTypes from 'prop-types';
import './Promotion.css';

const Promotion = ({ title, description, imageUrl, validUntil }) => {
  return (
    <div className="promotion-card">
      <div className="promotion-image">
        <img src={imageUrl} alt={title} />
      </div>
      <div className="promotion-content">
        <h3>{title}</h3>
        <p>{description}</p>
        {validUntil && (
          <p className="valid-until">
            Válido hasta: {new Date(validUntil).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};

Promotion.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
  validUntil: PropTypes.string
};

export default Promotion; 
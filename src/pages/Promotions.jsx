import { useState, useEffect } from 'react';
import axios from 'axios';
import Promotion from '../components/Promotion';
import './Promotions.css';

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await axios.get('http://localhost:8000/backend/api/promotions.php');
        setPromotions(response.data);
      } catch (error) {
        console.error('Error fetching promotions:', error);
        setError('Error loading promotions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  const handleCreatePromotion = async (formData) => {
    try {
      const response = await axios.post(
        'http://localhost:8000/backend/api/promotions.php',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      // Add the new promotion to the list
      setPromotions([response.data, ...promotions]);
      return { success: true };
    } catch (error) {
      console.error('Error creating promotion:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error creating promotion. Please try again.' 
      };
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="promotions-page">
      <div className="container">
        <h1>Promociones y Ofertas Especiales</h1>
        <p className="promotions-intro">
          Descubra nuestras promociones actuales y aproveche los mejores servicios médicos a precios especiales.
        </p>

        {promotions.length > 0 ? (
          <div className="promotions-grid">
            {promotions.map(promotion => (
              <Promotion key={promotion.id} {...promotion} />
            ))}
          </div>
        ) : (
          <div className="no-promotions">
            <p>No hay promociones disponibles en este momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Promotions; 
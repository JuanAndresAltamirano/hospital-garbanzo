import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import Promotion from '../components/Promotion';
import './Promotions.css';

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const q = query(
          collection(db, 'promotions'),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const promotionsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setPromotions(promotionsData);
      } catch (error) {
        console.error('Error fetching promotions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  return (
    <div className="promotions-page">
      <div className="container">
        <h1>Promociones y Ofertas Especiales</h1>
        <p className="promotions-intro">
          Descubra nuestras promociones actuales y aproveche los mejores servicios médicos a precios especiales.
        </p>

        {loading ? (
          <div className="loading">Cargando promociones...</div>
        ) : promotions.length > 0 ? (
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
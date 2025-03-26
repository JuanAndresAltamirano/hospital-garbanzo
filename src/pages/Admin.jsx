import { useState, useEffect } from 'react';
import PromotionForm from '../components/admin/PromotionForm';
import Promotion from '../components/Promotion';
import './Admin.css';

const API_URL = 'http://localhost/backend/api';

const Admin = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPromotions = async () => {
    try {
      const response = await fetch(`${API_URL}/promotions.php`);
      if (!response.ok) {
        throw new Error('Error fetching promotions');
      }
      const data = await response.json();
      setPromotions(data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta promoción?')) {
      try {
        const response = await fetch(`${API_URL}/promotions.php?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Error deleting promotion');
        }

        setPromotions(promotions.filter(promo => promo.id !== id));
        alert('Promoción eliminada exitosamente');
      } catch (error) {
        console.error('Error deleting promotion:', error);
        alert('Error al eliminar la promoción');
      }
    }
  };

  return (
    <div className="admin">
      <div className="container">
        <h1>Panel de Administración</h1>
        
        <section className="admin-section">
          <h2>Nueva Promoción</h2>
          <PromotionForm onSuccess={fetchPromotions} />
        </section>

        <section className="admin-section">
          <h2>Promociones Actuales</h2>
          {loading ? (
            <p>Cargando promociones...</p>
          ) : (
            <div className="promotions-grid">
              {promotions.map(promotion => (
                <div key={promotion.id} className="promotion-item">
                  <Promotion {...promotion} />
                  <button
                    className="btn btn-delete"
                    onClick={() => handleDelete(promotion.id)}
                  >
                    Eliminar Promoción
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Admin; 
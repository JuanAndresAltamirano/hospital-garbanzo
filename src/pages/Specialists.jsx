import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { toast } from 'react-toastify';
import './Specialists.css';

const Specialists = () => {
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpecialists();
  }, []);

  const fetchSpecialists = async () => {
    try {
      const response = await apiService.get('/specialists');
      setSpecialists(response.data);
    } catch (error) {
      console.error('Error fetching specialists:', error);
      toast.error('Error al cargar los especialistas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="specialists">
        <div className="container">
          <h1>Cargando especialistas...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="specialists">
      <div className="container">
        <h1>Nuestros Especialistas</h1>
        <p className="specialists-intro">
          Contamos con un equipo de profesionales altamente calificados y comprometidos con su salud.
        </p>

        <div className="specialists-grid">
          {specialists.map((specialist) => (
            <div key={specialist.id} className="specialist-card">
              <div className="specialist-image">
                <img 
                  src={specialist.image} 
                  alt={specialist.name}
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
              </div>
              <div className="specialist-content">
                <h3>{specialist.name}</h3>
                <h4>{specialist.specialty}</h4>
                <p>{specialist.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Specialists; 
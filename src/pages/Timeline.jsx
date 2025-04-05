import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import timelineService from '../services/timelineService';
import './Timeline.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Timeline = () => {
  const [timelines, setTimelines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimelines();
  }, []);

  const fetchTimelines = async () => {
    try {
      const data = await timelineService.getAll();
      setTimelines(data);
    } catch (error) {
      console.error('Error fetching timelines:', error);
      toast.error('Error al cargar la línea de tiempo');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="timeline-page">
      <div className="timeline-header">
        <h1>Nuestra Historia</h1>
        <p>Un recorrido por los momentos más importantes de nuestra institución</p>
      </div>

      <div className="timeline-container">
        {timelines.map((timeline, index) => (
          <div
            key={timeline.id}
            className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
          >
            <div className="timeline-content">
              <div className="timeline-year">{timeline.year}</div>
              <div className="timeline-image">
                <img
                  src={`${API_URL}/uploads/${timeline.image}`}
                  alt={timeline.title}
                  onError={(e) => {
                    e.target.src = './public/uploads/image-not-found.jpg';
                  }}
                />
              </div>
              <div className="timeline-details">
                <h3>{timeline.title}</h3>
                <p>{timeline.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline; 
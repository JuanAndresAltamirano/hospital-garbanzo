import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import timelineService from '../services/timelineService';
import './Timeline.css';

// Get base URL without /api for image loading
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const BASE_URL = API_URL.replace(/\/api$/, '');

// Default timeline entries to use as fallback
const defaultTimelineEntries = [
  {
    id: 'default-1',
    year: '2011',
    title: 'Fundación',
    description: 'El Dr. Marco Vinicio Mullo, con una visión clara y ambiciosa, fundó nuestro centro médico con el objetivo de ofrecer atención de calidad a toda la población. Su sueño era crear un espacio amplio que combinara diversos servicios especializados, accesibles a precios razonables sin comprometer la excelencia.'
  },
  {
    id: 'default-2',
    year: '2011-Presente',
    title: 'Crecimiento y Desarrollo',
    description: 'El Dr. Mullo se comprometió a equipar el centro con tecnología de vanguardia y a diseñar un ambiente cómodo y acogedor para los pacientes. Gracias a su liderazgo y dedicación, el centro médico ha crecido hasta convertirse en un referente en la región, reconocido por su equipo profesional y su enfoque integral en la atención médica. Hoy, seguimos fieles a la visión del Dr. Mullo, proporcionando cuidados excepcionales con un equipo de especialistas altamente capacitados y la mejor tecnología disponible, siempre con el objetivo de servir a nuestra comunidad de manera integral y accesible.'
  }
];

const Timeline = () => {
  const [timelines, setTimelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const timelineRef = useRef(null);

  useEffect(() => {
    fetchTimelines();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          }
        });
      },
      { threshold: 0.2 }
    );

    const timelineItems = document.querySelectorAll('.timeline-entry');
    timelineItems.forEach((item) => {
      observer.observe(item);
    });

    return () => {
      timelineItems.forEach((item) => {
        observer.unobserve(item);
      });
    };
  }, [timelines]);

  const fetchTimelines = async () => {
    try {
      const data = await timelineService.getAll();
      // Sort by year
      const sortedData = [...data].sort((a, b) => a.year - b.year);
      setTimelines(sortedData.length > 0 ? sortedData : defaultTimelineEntries);
    } catch (error) {
      console.error('Error fetching timelines:', error);
      setError(true);
      // Use default timeline entries as fallback
      setTimelines(defaultTimelineEntries);
      toast.error('Error al cargar la línea de tiempo, mostrando información básica');
    } finally {
      setLoading(false);
    }
  };

  // Helper function for image URLs
  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    return `${BASE_URL}/uploads/${imageName}`;
  };

  if (loading) {
    return (
      <div className="timeline-loading">
        <div className="timeline-spinner">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" />
          </svg>
        </div>
        <p>Cargando nuestra historia...</p>
      </div>
    );
  }

  return (
    <div className="timeline-component" ref={timelineRef}>
      {timelines.length === 0 ? (
        <div className="timeline-empty">
          <div className="timeline-empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12" y2="16"></line>
            </svg>
          </div>
          <h3>Aún no hay eventos en nuestra línea de tiempo</h3>
          <p>Pronto compartiremos los momentos clave de nuestra trayectoria médica.</p>
        </div>
      ) : (
        <div className="timeline">
          <div className="timeline-line"></div>
          
          {timelines.map((event) => (
            <div 
              className="timeline-entry"
              key={event.id}
            >
              <div className="timeline-marker">
                <span className="timeline-date">{event.year}</span>
                <div className="timeline-dot"></div>
              </div>
              
              <div className="timeline-card">
                <span className="timeline-year-mobile">{event.year}</span>
                <h3 className="timeline-title">{event.title}</h3>
                
                {event.image && (
                  <div className="timeline-media">
                    <img
                      src={getImageUrl(event.image)}
                      alt={event.title}
                      onError={(e) => {
                        console.error('Timeline image load error:', e.target.src);
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = '/placeholder-image.jpg';
                      }}
                      loading="lazy"
                    />
                  </div>
                )}
                
                <div className="timeline-content">
                  <p>{event.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Timeline; 
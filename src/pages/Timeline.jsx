import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import timelineService from '../services/timelineService';
import './Timeline.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Timeline = () => {
  const [timelines, setTimelines] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setTimelines(sortedData);
    } catch (error) {
      console.error('Error fetching timelines:', error);
      toast.error('Error al cargar la línea de tiempo');
    } finally {
      setLoading(false);
    }
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
                <h3 className="timeline-title">{event.title}</h3>
                
                {event.image && (
                  <div className="timeline-media">
                    <img
                      src={`${API_URL}/uploads/${event.image}`}
                      alt={event.title}
                      onError={(e) => {
                        e.target.src = '/uploads/image-not-found.jpg';
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
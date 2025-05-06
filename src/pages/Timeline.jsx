import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaPlay, FaVideo, FaExternalLinkAlt } from 'react-icons/fa';
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

// Function to extract TikTok embed code from URL
const getTikTokEmbedCode = (url) => {
  if (!url) return null;
  
  try {
    // Check if it's a TikTok URL
    if (url.includes('tiktok.com')) {
      // Extract video ID
      const regex = /\/video\/(\d+)/;
      const match = url.match(regex);
      
      if (match && match[1]) {
        const videoId = match[1];
        return `<blockquote class="tiktok-embed" cite="${url}" data-video-id="${videoId}" style="max-width: 605px; min-width: 325px;">
          <section></section>
        </blockquote>
        <script async src="https://www.tiktok.com/embed.js"></script>`;
      }
    }
    
    // For YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      
      if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get('v');
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      }
      
      if (videoId) {
        return `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      }
    }
    
    // Default for other video platforms - just show a link
    return null;
  } catch (error) {
    console.error('Error parsing video URL:', error);
    return null;
  }
};

const Timeline = () => {
  const [timelines, setTimelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState(null);
  const timelineRef = useRef(null);
  const videoRefs = useRef({});

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
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
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

  // Effect to load TikTok script when needed
  useEffect(() => {
    if (activeVideoId) {
      const videoContainer = videoRefs.current[activeVideoId];
      if (videoContainer) {
        // For TikTok videos
        if (videoContainer.querySelector('.tiktok-embed')) {
          // Check if TikTok script is already loaded
          if (window.tiktokScriptLoaded) {
            // Call the TikTok embed script function manually
            if (window.tiktok && window.tiktok.embed) {
              window.tiktok.embed.reload();
            }
          } else {
            // Load TikTok script
            const script = document.createElement('script');
            script.src = 'https://www.tiktok.com/embed.js';
            script.async = true;
            script.onload = () => {
              window.tiktokScriptLoaded = true;
            };
            document.body.appendChild(script);
          }
        }
      }
    }
  }, [activeVideoId]);

  const fetchTimelines = async () => {
    try {
      const data = await timelineService.getAll();
      // Sort by year
      const sortedData = [...data].sort((a, b) => {
        // Handle year ranges like "2010-2020" by comparing the first number
        const yearA = parseInt(a.year.toString().split('-')[0]);
        const yearB = parseInt(b.year.toString().split('-')[0]);
        return yearA - yearB;
      });
      
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

  // Function to toggle video playback
  const toggleVideo = (id) => {
    setActiveVideoId(activeVideoId === id ? null : id);
  };

  // Function to determine if the entry has media (image or video)
  const hasMedia = (entry) => {
    return entry.image || entry.videoUrl;
  };

  // Function to render the appropriate media for an entry
  const renderMedia = (entry) => {
    if (entry.videoUrl) {
      const embedCode = getTikTokEmbedCode(entry.videoUrl);
      
      return (
        <div 
          className={`timeline-media timeline-video ${activeVideoId === entry.id ? 'active' : ''}`}
          onClick={() => toggleVideo(entry.id)}
        >
          {activeVideoId === entry.id ? (
            <div 
              className="video-embed-container" 
              ref={el => videoRefs.current[entry.id] = el}
              dangerouslySetInnerHTML={{ __html: embedCode || '' }}
            />
          ) : (
            <>
              <div className="video-preview">
                <div className="play-button">
                  <FaPlay />
                </div>
                <div className="video-info">
                  <FaVideo />
                  <span>Ver video</span>
                </div>
              </div>
              {!embedCode && (
                <a 
                  href={entry.videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="external-video-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaExternalLinkAlt /> Ver en sitio original
                </a>
              )}
            </>
          )}
        </div>
      );
    } else if (entry.image) {
      return (
        <div className="timeline-media">
          <img
            src={getImageUrl(entry.image)}
            alt={`${entry.title} - Año ${entry.year}`}
            loading="lazy"
            onError={(e) => {
              console.error('Timeline image load error:', e.target.src);
              e.target.onerror = null; // Prevent infinite loop
              e.target.style.display = 'none'; // Hide broken images in mobile
            }}
          />
        </div>
      );
    }
    
    return null;
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
          
          {timelines.map((event, index) => (
            <div 
              className="timeline-entry"
              key={event.id}
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <div className="timeline-marker">
                <span className="timeline-date">{event.year}</span>
                <div className="timeline-dot"></div>
              </div>
              
              <div className="timeline-card">
                <span className="timeline-year-mobile">{event.year}</span>
                <h3 className="timeline-title">{event.title}</h3>
                
                {hasMedia(event) && renderMedia(event)}
                
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
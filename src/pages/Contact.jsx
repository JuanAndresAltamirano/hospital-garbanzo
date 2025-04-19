import React, { useState, useEffect } from 'react';
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaClock, 
  FaPaperPlane, 
  FaChevronRight, 
  FaImage,
  FaTimes,
  FaArrowLeft,
  FaArrowRight,
  FaPlus,
  FaInstagram,
  FaFacebook,
  FaDirections
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Contact.css';

// Gallery configuration - organized by categories/sections
const hospitalGallery = {
  title: "Galería de Imágenes",
  subtitle: "Conozca nuestras instalaciones y servicios a través de nuestra galería",
  // Organize photos by category
  categories: [
    {
      id: "instalaciones",
      name: "Instalaciones",
      description: "Conozca nuestras modernas instalaciones diseñadas para la comodidad de nuestros pacientes",
      images: [
        {
          src: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80",
          alt: "Fachada del Hospital",
          caption: "Entrada principal al Centro Médico"
        },
        {
          src: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80",
          alt: "Sala de espera"
        },
        {
          src: "https://images.unsplash.com/photo-1579684288361-5c1a2957cc28?auto=format&fit=crop&q=80",
          alt: "Recepción"
        },
        {
          src: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80",
          alt: "Pasillo principal"
        }
      ]
    },
    {
      id: "consultorios",
      name: "Consultorios",
      description: "Áreas de atención médica equipadas con tecnología de vanguardia",
      images: [
        {
          src: "https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&q=80",
          alt: "Consultorio médico",
          caption: "Consultorios equipados con tecnología de última generación"
        },
        {
          src: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80",
          alt: "Sala de procedimientos"
        },
        {
          src: "https://images.unsplash.com/photo-1666214277657-e60f06e2add3?auto=format&fit=crop&q=80",
          alt: "Sala de examen"
        }
      ]
    },
    {
      id: "equipos",
      name: "Equipamiento",
      description: "Contamos con equipos médicos de última generación para diagnósticos precisos",
      images: [
        {
          src: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80",
          alt: "Equipamiento médico",
          caption: "Contamos con equipos médicos de última generación"
        },
        {
          src: "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&q=80",
          alt: "Equipo de diagnóstico"
        },
        {
          src: "https://images.unsplash.com/photo-1600443271879-6579d5e3f876?auto=format&fit=crop&q=80",
          alt: "Consultorio equipado"
        }
      ]
    },
    {
      id: "equipo",
      name: "Nuestro Equipo",
      description: "Personal médico altamente calificado a su servicio",
      images: [
        {
          src: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80",
          alt: "Personal médico",
          caption: "Nuestro equipo de profesionales altamente calificados"
        },
        {
          src: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80",
          alt: "Médico especialista"
        }
      ]
    }
  ],
  // Function to get all images flattened (for the modal view)
  getAllImages: function() {
    return this.categories.reduce((allImages, category) => {
      return [...allImages, ...category.images.map(img => ({
        ...img,
        category: category.name
      }))];
    }, []);
  }
};

// Categorized Gallery component
const CategorizedGallery = ({ title, subtitle, categories, onImageClick }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  
  // Set first category as active by default
  useEffect(() => {
    if (categories && categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories]);
  
  if (!categories || categories.length === 0) return null;
  
  return (
    <section className="gallery-section animate-in">
      <div className="container">
        {title && <h2 className="section-title">{title}</h2>}
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
        
        <div className="gallery-categories">
          {categories.map(category => (
            <button 
              key={category.id}
              className={`gallery-category-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {categories.map(category => (
          <div 
            key={category.id} 
            className={`gallery-category-content ${activeCategory === category.id ? 'active' : ''}`}
          >
            <p className="gallery-category-description">{category.description}</p>
            
            <div className="gallery-grid">
              {category.images.map((image, imageIndex) => {
                // Calculate the global index for this image
                const globalIndex = categories.reduce((count, cat, catIndex) => {
                  if (catIndex < categories.findIndex(c => c.id === category.id)) {
                    return count + cat.images.length;
                  }
                  return count;
                }, 0) + imageIndex;
                
                return (
                  <div 
                    className="gallery-item" 
                    key={imageIndex} 
                    onClick={() => onImageClick(globalIndex)}
                  >
                    <div className="gallery-image-container">
                      <img src={image.src} alt={image.alt || 'Imagen de galería'} loading="lazy" />
                      <div className="gallery-overlay">
                        <FaImage />
                        <span>Ver imagen</span>
                      </div>
                    </div>
                    {image.caption && <div className="gallery-caption">{image.caption}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// Gallery Modal component
const GalleryModal = ({ isOpen, images, currentIndex, onClose, onNext, onPrev }) => {
  if (!isOpen || !images || images.length === 0) return null;
  
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') onNext(e);
    if (e.key === 'ArrowLeft') onPrev(e);
  };
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const currentImage = images[currentIndex];
  
  return (
    <div className="gallery-modal" onClick={onClose}>
      <button className="gallery-close" onClick={onClose}>
        <FaTimes />
      </button>
      <button className="gallery-nav gallery-prev" onClick={onPrev}>
        <FaArrowLeft />
      </button>
      <div className="gallery-content" onClick={(e) => e.stopPropagation()}>
        <img 
          src={currentImage.src} 
          alt={currentImage.alt || 'Imagen ampliada'} 
          className="gallery-modal-image"
        />
        <div className="gallery-modal-caption">
          {currentImage.category && (
            <div className="gallery-image-category">{currentImage.category}</div>
          )}
          <h3>{currentImage.alt || 'Imagen'}</h3>
          {currentImage.caption && <p>{currentImage.caption}</p>}
          <div className="gallery-counter">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </div>
      <button className="gallery-nav gallery-next" onClick={onNext}>
        <FaArrowRight />
      </button>
    </div>
  );
};

const Contact = () => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [isIntersecting, setIsIntersecting] = useState({
    info: false,
    map: false,
    gallery: false
  });

  // Get all images for the modal view
  const allGalleryImages = hospitalGallery.getAllImages();

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };
    
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsIntersecting(prev => ({
            ...prev,
            [entry.target.dataset.section]: true
          }));
        }
      });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    const infoSection = document.querySelector('.contact-info-section');
    const mapSection = document.querySelector('.map-section');
    const gallerySection = document.querySelector('.gallery-section');
    
    if (infoSection) {
      infoSection.dataset.section = 'info';
      observer.observe(infoSection);
    }
    
    if (mapSection) {
      mapSection.dataset.section = 'map';
      observer.observe(mapSection);
    }
    
    if (gallerySection) {
      gallerySection.dataset.section = 'gallery';
      observer.observe(gallerySection);
    }
    
    return () => {
      if (infoSection) observer.unobserve(infoSection);
      if (mapSection) observer.unobserve(mapSection);
      if (gallerySection) observer.unobserve(gallerySection);
    };
  }, []);

  const openGallery = (index) => {
    setCurrentImage(index);
    setGalleryOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    setGalleryOpen(false);
    document.body.style.overflow = 'auto';
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev === allGalleryImages.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev === 0 ? allGalleryImages.length - 1 : prev - 1));
  };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1>Contacto</h1>
          <p>Estamos aquí para atender sus consultas y brindarle la mejor atención</p>
          <div className="hero-scroll-indicator">
            <div className="scroll-arrow"></div>
            <span>Desplazar para más información</span>
          </div>
        </div>
      </section>

      <section className={`contact-info-section ${isIntersecting.info ? 'animate-in' : ''}`}>
        <div className="container">
          <h2 className="section-title">Información de Contacto</h2>
          <p className="section-subtitle">Múltiples canales disponibles para atender sus consultas</p>
          
          <div className="contact-info-grid">
            <div className="contact-info-card">
              <div className="contact-icon">
                <FaMapMarkerAlt />
              </div>
              <h3>Dirección</h3>
              <p>Vía Aguarico y Calle Chile</p>
              <p>Referencia: Frente al Parque Central</p>
              <a href="https://maps.app.goo.gl/A5D7nQCh7NDV9yUZA" className="contact-link" target="_blank" rel="noopener noreferrer">
                Ver en Google Maps <FaChevronRight />
              </a>
            </div>
            
            <div className="contact-info-card">
              <div className="contact-icon">
                <FaPhone />
              </div>
              <h3>Teléfonos</h3>
              <p>+593 99 123 4567</p>
              <p>+593 2 345 6789</p>
              <a href="tel:+593991234567" className="contact-link">
                Llamar ahora <FaChevronRight />
              </a>
            </div>
            
            <div className="contact-info-card">
              <div className="contact-icon">
                <FaEnvelope />
              </div>
              <h3>Correo Electrónico</h3>
              <p>maryelenaobando79@yahoo.es</p>
              <p>citas@hospitalmullo.com</p>
              <a href="mailto:maryelenaobando79@yahoo.es" className="contact-link">
                Enviar email <FaChevronRight />
              </a>
            </div>
            
            <div className="contact-info-card">
              <div className="contact-icon">
                <FaClock />
              </div>
              <h3>Redes Sociales</h3>
              <div className="social-links">
                <a href="https://www.instagram.com/centrodeespecialidadesmvm_/" className="social-link" target="_blank" rel="noopener noreferrer">
                  <FaInstagram />
                  <span>@centrodeespecialidadesmvm_</span>
                </a>
                <a href="https://www.facebook.com/profile.php?id=100010625824060" className="social-link" target="_blank" rel="noopener noreferrer">
                  <FaFacebook />
                  <span>Facebook</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Using the Categorized Gallery component */}
      <div className={`${isIntersecting.gallery ? 'animate-in' : ''}`}>
        <CategorizedGallery 
          title={hospitalGallery.title}
          subtitle={hospitalGallery.subtitle}
          categories={hospitalGallery.categories}
          onImageClick={openGallery}
        />
      </div>

      {/* Gallery Modal */}
      <GalleryModal 
        isOpen={galleryOpen}
        images={allGalleryImages}
        currentIndex={currentImage}
        onClose={closeGallery}
        onNext={nextImage}
        onPrev={prevImage}
      />

      {/* Map section moved to the end */}
      <section className={`map-section ${isIntersecting.map ? 'animate-in' : ''}`}>
        <div className="container">
          <h2 className="section-title">Nuestra Ubicación</h2>
          <p className="section-subtitle">Visítenos en nuestras instalaciones ubicadas en Vía Aguarico y Calle Chile</p>
          
          <div className="map-container">
            <div className="map-card">
              <div className="map-wrapper">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.2493962055687!2d-76.8971807!3d0.0810827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e2823dd9358d955%3A0xdea910ce43daba02!2sCentro%20de%20Especialidades%20M%C3%A9dicas%20Dr.%20Marco%20Vinicio%20Mullo!5e0!3m2!1sen!2sec!4v1719187426972!5m2!1sen!2sec"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación del Centro de Especialidades Médicas Dr. Marco Vinicio Mullo"
                ></iframe>
              </div>
              <div className="map-info">
                <div className="map-address">
                  <h3>Centro de Especialidades Médicas Dr. Marco Vinicio Mullo</h3>
                  <p><FaMapMarkerAlt /> Vía Aguarico y Calle Chile</p>
                  <p>Lago Agrio, Ecuador</p>
                  <div className="map-actions">
                    <a 
                      href="https://www.google.com/maps/place/Centro+de+Especialidades+M%C3%A9dicas+Dr.+Marco+Vinicio+Mullo/@0.0810827,-76.8971807,17z/data=!3m1!4b1!4m6!3m5!1s0x8e2823dd9358d955:0xdea910ce43daba02!8m2!3d0.0810827!4d-76.8971807!16s%2Fg%2F11h0crfskr?entry=ttu" 
                      className="btn btn-outline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaDirections /> Cómo llegar
                    </a>
                    <a 
                      href="https://www.google.com/maps/uv?pb=!1s0x8e2823dd9358d955%3A0xdea910ce43daba02!3m1!7e115!4s%2Fmaps%2Fplace%2Fclinica%2Bmullo%2F%400.0811518%2C-76.8970863%2C3a%2C75y%2C36.37h%2C90t%2Fdata%3D*213m4*211e1*213m2*211s4zWEjZt6y-pSDFnysuSVVQ*212e0*214m2*213m1*211s0x8e2823dd9358d955%3A0xdea910ce43daba02%3Fsa%3DX%26ved%3D2ahUKEwjk4fGiveSMAxXmSjABHeA3LqsQpx96BAgxEAA!5sclinica%20mullo%20-%20Google%20Search!15sCgIgAQ&imagekey=!1e2!2s4zWEjZt6y-pSDFnysuSVVQ&cr=le_a7&hl=en" 
                      className="btn btn-outline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaImage /> Ver fotos 360°
                    </a>
                  </div>
                </div>
                <div className="map-hours">
                  <h4>Horario de Atención</h4>
                  <div className="hours-grid">
                    <div className="day">Lunes - Viernes:</div>
                    <div className="time">8:00 AM - 7:00 PM</div>
                    <div className="day">Sábados:</div>
                    <div className="time">8:00 AM - 2:00 PM</div>
                    <div className="day">Domingos:</div>
                    <div className="time">Cerrado</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact; 
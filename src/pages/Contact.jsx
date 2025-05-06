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
  FaDirections,
  FaImages
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { galleryService } from '../services/galleryService';
import './Contact.css';

// Fallback gallery configuration in case the API fails
const fallbackGallery = {
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
          alt: "Sala de espera",
          caption: "Área de recepción y espera para pacientes"
        },
        {
          src: "https://images.unsplash.com/photo-1581360742512-021d5b2157d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fGhvc3BpdGFsfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
          alt: "Exterior del Hospital",
          caption: "Vista del exterior del Centro Médico"
        }
      ],
      subcategories: [
        {
          id: "exteriores",
          name: "Exteriores",
          description: "Vistas de las instalaciones exteriores del hospital",
          images: [
            {
              src: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80",
              alt: "Fachada Principal",
              caption: "Entrada principal al Centro Médico"
            },
            {
              src: "https://images.unsplash.com/photo-1581360742512-021d5b2157d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fGhvc3BpdGFsfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
              alt: "Vista Lateral",
              caption: "Vista lateral del Centro Médico"
            }
          ]
        },
        {
          id: "interiores",
          name: "Interiores",
          description: "Espacios interiores diseñados para la comodidad de nuestros pacientes",
          images: [
            {
              src: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80",
              alt: "Recepción",
              caption: "Área de recepción y espera para pacientes"
            },
            {
              src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fGhvc3BpdGFsJTIwcm9vbXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
              alt: "Sala de Espera",
              caption: "Cómoda área de espera para pacientes y familiares"
            }
          ]
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
          src: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fGRvY3RvciUyMG9mZmljZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
          alt: "Sala de examen",
          caption: "Sala de exámenes médicos"
        }
      ],
      subcategories: [
        {
          id: "medicina-general",
          name: "Medicina General",
          description: "Consultorios para atención médica general",
          images: [
            {
              src: "https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&q=80",
              alt: "Consultorio General",
              caption: "Consultorio de medicina general"
            }
          ]
        },
        {
          id: "especialidades",
          name: "Especialidades",
          description: "Consultorios para diferentes especialidades médicas",
          images: [
            {
              src: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fGRvY3RvciUyMG9mZmljZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
              alt: "Consultorio Especializado",
              caption: "Consultorio para especialidades médicas"
            }
          ]
        }
      ]
    },
    {
      id: "equipos",
      name: "Equipos Médicos",
      description: "Tecnología médica avanzada para diagnósticos precisos y tratamientos efectivos",
      images: [
        {
          src: "https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8bWVkaWNhbCUyMGVxdWlwbWVudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
          alt: "Equipo de diagnóstico",
          caption: "Equipos modernos para diagnósticos precisos"
        }
      ],
      subcategories: [
        {
          id: "diagnostico",
          name: "Equipos de Diagnóstico",
          description: "Equipos modernos para diagnósticos precisos",
          images: [
            {
              src: "https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8bWVkaWNhbCUyMGVxdWlwbWVudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
              alt: "Equipo Diagnóstico",
              caption: "Equipamiento para diagnósticos médicos"
            }
          ]
        },
        {
          id: "tratamiento",
          name: "Equipos de Tratamiento",
          description: "Tecnología avanzada para tratamientos médicos",
          images: [
            {
              src: "https://images.unsplash.com/photo-1597764690523-15bea4c581c9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8bWVkaWNhbCUyMGVxdWlwbWVudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
              alt: "Equipo Terapéutico",
              caption: "Equipo para tratamientos médicos especializados"
            }
          ]
        }
      ]
    }
  ],
  // Function to get all images flattened (for the modal view)
  getAllImages: function() {
    let allImages = [];
    
    this.categories.forEach(category => {
      // Add images from main category
      if (category.images) {
        allImages = [...allImages, ...category.images.map(img => ({
          ...img,
          category: category.name
        }))];
      }
      
      // Add images from subcategories
      if (category.subcategories) {
        category.subcategories.forEach(subcategory => {
          if (subcategory.images) {
            allImages = [...allImages, ...subcategory.images.map(img => ({
              ...img,
              category: category.name,
              subcategory: subcategory.name
            }))];
          }
        });
      }
    });
    
    return allImages;
  }
};

// Categorized Gallery component
const CategorizedGallery = ({ title, subtitle, categories, onImageClick }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [loadingImages, setLoadingImages] = useState(false);
  
  // Set first category as active by default
  useEffect(() => {
    if (categories && categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories]);
  
  if (!categories || categories.length === 0) return null;
  
  // Get current category object - safe check that it exists
  const currentCategory = categories.find(cat => cat.id === activeCategory) || categories[0];
  
  // Safety check before accessing properties
  if (!currentCategory) {
    return (
      <section className="gallery-section animate-in">
        <div className="container">
          {title && <h2 className="section-title">{title}</h2>}
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
          <div className="no-images-message">
            <p>No hay categorías disponibles</p>
          </div>
        </div>
      </section>
    );
  }
  
  // Check if current category has subcategories
  const hasSubcategories = currentCategory.subcategories && 
                          currentCategory.subcategories.length > 0;
  
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
        
        {/* Display current category description */}
        <div className="gallery-category-content active">
          <p className="gallery-category-description">{currentCategory?.description || ''}</p>
          
          {loadingImages ? (
            <div className="loading-gallery">
              <p>Cargando imágenes</p>
            </div>
          ) : (
            <div className="gallery-grid">
              {currentCategory?.subcategories && currentCategory.subcategories.length > 0 ? (
                currentCategory.subcategories.map((subcategory, index) => (
                  <div 
                    className="gallery-item" 
                    key={index}
                    onClick={() => onImageClick(currentCategory.id, 0, subcategory.id)}
                  >
                    <div className="gallery-image-container">
                      <img 
                        src={subcategory.images && subcategory.images.length > 0 
                          ? subcategory.images[0].src 
                          : 'https://via.placeholder.com/300x250?text=No+Image'}
                        alt={subcategory.name || 'Imagen de galería'} 
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          console.error('Image failed to load:', e.target.src);
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x250?text=Imagen+No+Disponible';
                        }}
                      />
                      <div className="gallery-overlay">
                        <FaImage />
                        <span>{subcategory.description || subcategory.name}</span>
                      </div>
                    </div>
                    <div className="gallery-caption">{ subcategory.name}</div>
                  </div>
                ))
              ) : (
                <div className="no-images-message">
                  <p>No hay subcategorías disponibles para esta categoría</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// Gallery Modal component
const GalleryModal = ({ isOpen, categories, subcategoryImages, currentCategory, currentSubcategory, currentIndex, onClose, onNext, onPrev }) => {
  if (!isOpen || !categories || categories.length === 0) return null;
  
  // Find the current category by ID
  const category = categories.find(cat => cat.id === currentCategory);
  if (!category) return null;
  
  // Use images from subcategory if available, otherwise use category images
  let images;
  let displayTitle = category.name;
  
  if (currentSubcategory) {
    // If we have subcategory images from API, use those
    if (subcategoryImages && subcategoryImages.length > 0) {
      images = subcategoryImages;
      // Look up subcategory name
      const subcategory = category.subcategories?.find(sub => sub.id === currentSubcategory);
      if (subcategory) {
        displayTitle = `${category.name} - ${subcategory.name}`;
      }
    } else if (category.subcategories) {
      // Fall back to embedded subcategory images
      const subcategory = category.subcategories.find(sub => sub.id === currentSubcategory);
      if (subcategory) {
        images = subcategory.images;
        displayTitle = `${category.name} - ${subcategory.name}`;
      } else {
        images = category.images;
      }
    } else {
      images = category.images;
    }
  } else {
    images = category.images;
  }
  
  if (!images || images.length === 0) return null;
  
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') onNext(e);
    if (e.key === 'ArrowLeft') onPrev(e);
  };
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    // Disable scrolling on body when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Re-enable scrolling when modal is closed
      document.body.style.overflow = 'auto';
    };
  }, []);
  
  const currentImage = images[currentIndex];
  
  // Error handling for image load
  const handleImageError = (e) => {
    console.error('Modal image failed to load:', currentImage.src);
    e.target.onerror = null; // Prevent infinite callback loop
    e.target.src = 'https://via.placeholder.com/800x600?text=Imagen+No+Disponible';
  };
  
  // Use createPortal to render the modal outside the normal DOM hierarchy
  return (
    <div className="gallery-modal">
      <div className="gallery-modal-overlay" onClick={onClose}></div>
      
      <div className="gallery-modal-container">
        <div className="gallery-category-top">{displayTitle.toUpperCase()}</div>
        
        <div className="gallery-image-area">
          <img 
            src={currentImage.src} 
            alt={currentImage.alt || 'Imagen ampliada'} 
            className="gallery-modal-image"
            onError={handleImageError}
          />
        </div>
        
        <div className="gallery-info-area">
          <h2 className="gallery-title">{currentImage.alt || 'Imagen'}</h2>
          <p className="gallery-description">{currentImage.title || ''}</p>
          <div className="gallery-counter">{currentIndex + 1} / {images.length}</div>
        </div>
      </div>
      
      <button className="gallery-close-btn" onClick={onClose} aria-label="Cerrar">
        <FaTimes />
      </button>
      
      <button className="gallery-nav gallery-prev" onClick={(e) => { e.stopPropagation(); onPrev(e); }} aria-label="Anterior">
        <FaArrowLeft />
      </button>
      
      <button className="gallery-nav gallery-next" onClick={(e) => { e.stopPropagation(); onNext(e); }} aria-label="Siguiente">
        <FaArrowRight />
      </button>
    </div>
  );
};

const Contact = () => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentSubcategory, setCurrentSubcategory] = useState(null);
  const [subcategoryImages, setSubcategoryImages] = useState([]);
  const [isIntersecting, setIsIntersecting] = useState({
    info: false,
    map: false,
    gallery: false
  });
  const [galleryData, setGalleryData] = useState(fallbackGallery);
  const [loading, setLoading] = useState(true);

  // Fetch gallery data
  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        setLoading(true);
        const data = await galleryService.getGalleryDataForContact();
        if (data && data.categories && data.categories.length > 0) {
          setGalleryData(data);
        }
      } catch (error) {
        console.error('Error loading gallery data:', error);
        // Fallback to default data is handled by the service
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryData();
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Set initial sections as visible after a delay
    setTimeout(() => {
      setIsIntersecting({
        info: true,
        map: true,
        gallery: true
      });
    }, 300);
  }, []);

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
  }, [loading]);

  const openGallery = async (categoryId, imageIndex, subcategoryId = null) => {
    setCurrentCategory(categoryId);
    setCurrentImage(imageIndex);
    
    // If a subcategory is selected, set it and fetch its images
    if (subcategoryId) {
      setCurrentSubcategory(subcategoryId);
      try {
        const images = await galleryService.getSubcategoryImages(categoryId, subcategoryId);
        setSubcategoryImages(images.length > 0 ? images : []);
      } catch (error) {
        console.error("Error loading subcategory images for gallery:", error);
        // Fallback to subcategory images from the categories data
        const category = galleryData.categories.find(cat => cat.id === categoryId);
        const subcategory = category?.subcategories?.find(sub => sub.id === subcategoryId);
        setSubcategoryImages(subcategory?.images || []);
      }
    } else {
      setCurrentSubcategory(null);
      setSubcategoryImages([]);
    }
    
    setGalleryOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    setGalleryOpen(false);
    document.body.style.overflow = 'auto';
  };

  const nextImage = (e) => {
    e.stopPropagation();
    const category = galleryData.categories.find(cat => cat.id === currentCategory);
    if (!category) return;
    
    let images;
    if (currentSubcategory) {
      // Use fetched subcategory images if available
      if (subcategoryImages && subcategoryImages.length > 0) {
        images = subcategoryImages;
      } else if (category.subcategories) {
        const subcategory = category.subcategories.find(sub => sub.id === currentSubcategory);
        images = subcategory ? subcategory.images : category.images;
      } else {
        images = category.images;
      }
    } else {
      images = category.images;
    }
    
    if (!images || images.length === 0) return;
    
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e) => {
    e.stopPropagation();
    const category = galleryData.categories.find(cat => cat.id === currentCategory);
    if (!category) return;
    
    let images;
    if (currentSubcategory) {
      // Use fetched subcategory images if available
      if (subcategoryImages && subcategoryImages.length > 0) {
        images = subcategoryImages;
      } else if (category.subcategories) {
        const subcategory = category.subcategories.find(sub => sub.id === currentSubcategory);
        images = subcategory ? subcategory.images : category.images;
      } else {
        images = category.images;
      }
    } else {
      images = category.images;
    }
    
    if (!images || images.length === 0) return;
    
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="container">
          <h1>Contacto</h1>
          <p className="contact-intro">
            Estamos aquí para atender sus consultas y brindarle la mejor atención
          </p>
        </div>
      </div>

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
              <p>Avenida aguarico y Calle Chile, parte posterior de la Federacion Deportiva de Sucumbios</p>
              <div className="contact-link-container">
                <a href="https://maps.app.goo.gl/T3JGMtkksu26LVPx9" className="contact-link btn btn-primary" target="_blank" rel="noopener noreferrer">
                  Ver en Google Maps <FaChevronRight />
                </a>
              </div>
            </div>
            
            <div className="contact-info-card">
              <div className="contact-icon">
                <FaPhone />
              </div>
              <h3>Teléfonos</h3>
              <p>+593967758178</p>
              <div className="contact-link-container">
                <a href="https://wa.me/593967758178?text=Hola%2C%20quisiera%20agendar%20una%20cita" className="contact-link btn btn-primary" target="_blank" rel="noopener noreferrer">
                  Contactenos <FaChevronRight />
                </a>
              </div>
            </div>
            
            <div className="contact-info-card">
              <div className="contact-icon">
                <FaEnvelope />
              </div>
              <h3>Correo Electrónico</h3>
              <p>centromedico-mvm@hotmail.com</p>
              <div className="contact-link-container">
                <a href="mailto:centromedico-mvm@hotmail.com" className="contact-link btn btn-primary">
                  Enviar email <FaChevronRight />
                </a>
              </div>
            </div>
            
            <div className="contact-info-card">
              <div className="contact-icon">
                <FaClock />
              </div>
              <h3>Redes Sociales</h3>
              <div className="social-links">
                <a href="https://www.instagram.com/centrodeespecialidadesmvm_/" className="social-link" target="_blank" rel="noopener noreferrer">
                  <FaInstagram />
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Using the Categorized Gallery component */}
      <section className={`gallery-section ${isIntersecting.gallery ? 'animate-in' : ''}`}>
        {loading ? (
          <div className="loading-gallery">
            <p>Cargando galería...</p>
          </div>
        ) : (
          <CategorizedGallery 
            title={galleryData.title}
            subtitle={galleryData.subtitle}
            categories={galleryData.categories}
            onImageClick={openGallery}
          />
        )}
      </section>

      {/* Gallery Modal */}
      <GalleryModal 
        isOpen={galleryOpen}
        categories={galleryData.categories}
        subcategoryImages={subcategoryImages}
        currentCategory={currentCategory}
        currentSubcategory={currentSubcategory}
        currentIndex={currentImage}
        onClose={closeGallery}
        onNext={nextImage}
        onPrev={prevImage}
      />

      {/* Map section */}
      <section className={`map-section ${isIntersecting.map ? 'animate-in' : ''}`}>
        <div className="container">
          <h2 className="section-title">Nuestra Ubicación</h2>
          <p className="section-subtitle">Visítenos en nuestras instalaciones ubicadas en Avenida aguarico y calle chile, parte posterior de la Federacion Deportiva de Sucumbios</p>
          
          <div className="map-container">
            <div className="map-card">
              <div className="map-wrapper">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!4v1746533197180!6m8!1m7!1sUxG7IQr5yckHz7tB31E_Dg!2m2!1d0.08125806037478567!2d-76.89724216747506!3f56.891211197258144!4f6.852862267318045!5f0.7820865974627469"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Vista Street View - Centro de Especialidades Médicas Dr. Marco Vinicio Mullo"
                ></iframe>
              </div>
              <div className="map-info">
                <div className="map-address">
                  <h3>Centro de Especialidades Médicas Dr. Marco V. Mullo</h3>
                  <p><FaMapMarkerAlt /> Avenida aguarico y calle chile, parte posterior de la Federacion Deportiva de Sucumbios</p>
                  <p>Lago Agrio, Ecuador</p>
                  <div className="map-actions">
                    <a 
                      href="https://maps.app.goo.gl/T3JGMtkksu26LVPx9" 
                      className="action-btn btn btn-primary" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <FaDirections /> Cómo llegar
                    </a>
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
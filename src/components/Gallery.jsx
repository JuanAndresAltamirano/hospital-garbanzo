import React, { useState, useEffect } from 'react';
import { FaImage, FaTimes, FaArrowLeft, FaArrowRight, FaImages, FaLayerGroup } from 'react-icons/fa';
import { galleryService } from '../services/galleryService';

const CategorizedGallery = ({ title, subtitle, onImageClick }) => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        setLoading(true);
        const data = await galleryService.getAllCategories();
        setCategories(data);
        
        // Set first category as active by default
        if (data && data.length > 0) {
          setActiveCategory(data[0].id);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching gallery data:', err);
        setError('Failed to load gallery content');
        setLoading(false);
      }
    };

    fetchGalleryData();
  }, []);

  if (loading) {
    return (
      <section className="gallery-section">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading gallery...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="gallery-section">
        <div className="container">
          <div className="error-container">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  // Calculate the start index for a category's images in the global array
  const getGlobalIndexStart = (categoryId) => {
    return categories.reduce((count, cat, catIndex) => {
      if (cat.id === categoryId) return count;
      if (catIndex < categories.findIndex(c => c.id === categoryId)) {
        return count + cat.images.length;
      }
      return count;
    }, 0);
  };

  return (
    <section className="gallery-section">
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
        
        {categories.map(category => {
          const globalIndexStart = getGlobalIndexStart(category.id);
          
          return (
            <div 
              key={category.id} 
              className={`gallery-category-content ${activeCategory === category.id ? 'active' : ''}`}
            >
              <p className="gallery-category-description">{category.description}</p>
              
              <div className="gallery-grid">
                {category.images.map((image, imageIndex) => {
                  const hasMultipleImages = category.images.length > 1;
                  
                  return (
                    <div 
                      key={image.id}
                      className="gallery-item" 
                      onClick={() => onImageClick(globalIndexStart + imageIndex)}
                    >
                      <div className={`gallery-image-container ${hasMultipleImages ? 'has-multiple' : ''}`}>
                        <img 
                          src={image.src} 
                          alt={image.alt || 'Imagen de galería'} 
                          loading="lazy" 
                          style={{ position: 'relative', zIndex: 2 }}
                        />
                        
                        {imageIndex === 0 && hasMultipleImages && (
                          <div className="gallery-corner-indicator">
                            <FaImages /> {category.images.length}
                          </div>
                        )}
                        
                        <div className="gallery-overlay">
                          <FaImage />
                          <span>Ver imagen</span>
                        </div>
                        
                        {imageIndex === 0 && hasMultipleImages && (
                          <div className="gallery-image-stack">
                            <FaLayerGroup />
                          </div>
                        )}
                      </div>
                      {image.caption && <div className="gallery-caption">{image.caption}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

// Gallery Modal component
const GalleryModal = ({ isOpen, categories, currentIndex, onClose, onNext, onPrev }) => {
  if (!isOpen || !categories || categories.length === 0) return null;
  
  // Flatten all images from all categories and add category information
  const allImages = categories.reduce((acc, category) => {
    return [...acc, ...category.images.map(img => ({
      ...img,
      category: category.name
    }))];
  }, []);
  
  if (allImages.length === 0) return null;
  
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') onNext(e);
    if (e.key === 'ArrowLeft') onPrev(e);
  };
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const currentImage = allImages[currentIndex];
  
  if (!currentImage) return null;
  
  return (
    <div className="gallery-modal" onClick={onClose}>
      <button className="gallery-close" onClick={onClose}>
        <FaTimes />
      </button>
      <button className="gallery-nav gallery-prev" onClick={onPrev}>
        <FaArrowLeft />
      </button>
      <div className="gallery-content" onClick={(e) => e.stopPropagation()}>
        <div className="gallery-category-title">
          <span>{currentImage.category}</span>
        </div>
        <img 
          src={currentImage.src} 
          alt={currentImage.alt || 'Imagen ampliada'} 
          className="gallery-modal-image"
        />
        <div className="gallery-modal-caption">
          <div className="gallery-image-category">{currentImage.category}</div>
          <h3>{currentImage.alt || 'Imagen'}</h3>
          {currentImage.caption && <p>{currentImage.caption}</p>}
          <div className="gallery-counter">
            {currentIndex + 1} / {allImages.length}
          </div>
        </div>
      </div>
      <button className="gallery-nav gallery-next" onClick={onNext}>
        <FaArrowRight />
      </button>
    </div>
  );
};

const Gallery = ({ title = "Galería de Imágenes", subtitle = "Conozca nuestras instalaciones y servicios a través de nuestra galería" }) => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        setLoading(true);
        const data = await galleryService.getAllCategories();
        setCategories(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching gallery data:', err);
        setError('Failed to load gallery content');
        setLoading(false);
      }
    };

    fetchGalleryData();
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
    
    // Calculate total images
    const totalImages = categories.reduce((count, category) => count + category.images.length, 0);
    
    setCurrentImage((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  const prevImage = (e) => {
    e.stopPropagation();
    
    // Calculate total images
    const totalImages = categories.reduce((count, category) => count + category.images.length, 0);
    
    setCurrentImage((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  if (loading) {
    return (
      <section className="gallery-section">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading gallery...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="gallery-section">
        <div className="container">
          <div className="error-container">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0 || categories.every(category => category.images.length === 0)) {
    return null;
  }

  return (
    <>
      <CategorizedGallery 
        title={title} 
        subtitle={subtitle} 
        categories={categories} 
        onImageClick={openGallery} 
      />
      
      <GalleryModal 
        isOpen={galleryOpen} 
        categories={categories}
        currentIndex={currentImage} 
        onClose={closeGallery} 
        onNext={nextImage} 
        onPrev={prevImage} 
      />
    </>
  );
};

export default Gallery; 
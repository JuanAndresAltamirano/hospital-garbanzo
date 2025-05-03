import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSort, FaUpload, FaImages } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-toastify';
import { galleryService } from '../../services/galleryService';
import './GalleryManager.css';

const GalleryManager = () => {
  const [mainCategories, setMainCategories] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categoryFormVisible, setCategoryFormVisible] = useState(false);
  const [subcategoryFormVisible, setSubcategoryFormVisible] = useState(false);
  const [imageFormVisible, setImageFormVisible] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', isMainCategory: true });
  const [subcategoryForm, setSubcategoryForm] = useState({ name: '', description: '', parentId: null });
  const [imageForm, setImageForm] = useState({ alt: '', caption: '', image: null, categoryId: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await galleryService.getAllCategories();
      const mainCats = data.filter(cat => cat.isMainCategory || (!cat.parentId && !cat.parent));
      setMainCategories(mainCats);
      
      // Remember currently selected categories
      const currentMainCategoryId = selectedMainCategory?.id;
      const currentSubcategoryId = selectedSubcategory?.id;
      
      // Select the first main category by default if none is selected
      if (mainCats.length > 0) {
        // If we already had a main category selected, find and select it again
        if (currentMainCategoryId) {
          const mainCategory = mainCats.find(cat => cat.id === currentMainCategoryId);
          if (mainCategory) {
            setSelectedMainCategory(mainCategory);
            
            // Get subcategories for this main category
            if (mainCategory.subcategories && mainCategory.subcategories.length > 0) {
              setSubcategories(mainCategory.subcategories);
              
              // If we had a subcategory selected, select it again
              if (currentSubcategoryId) {
                const subcategory = mainCategory.subcategories.find(sub => sub.id === currentSubcategoryId);
                if (subcategory) {
                  setSelectedSubcategory(subcategory);
                } else if (mainCategory.subcategories.length > 0) {
                  // If previous subcategory not found, select the first one
                  setSelectedSubcategory(mainCategory.subcategories[0]);
                }
              } else if (mainCategory.subcategories.length > 0) {
                // No subcategory was previously selected, select the first one
                setSelectedSubcategory(mainCategory.subcategories[0]);
              }
            } else {
              setSubcategories([]);
              setSelectedSubcategory(null);
            }
          } else {
            // Previously selected main category not found, select the first one
            setSelectedMainCategory(mainCats[0]);
            if (mainCats[0].subcategories && mainCats[0].subcategories.length > 0) {
              setSubcategories(mainCats[0].subcategories);
              setSelectedSubcategory(mainCats[0].subcategories[0]);
            } else {
              setSubcategories([]);
              setSelectedSubcategory(null);
            }
          }
        } else {
          // No main category was previously selected
          setSelectedMainCategory(mainCats[0]);
          if (mainCats[0].subcategories && mainCats[0].subcategories.length > 0) {
            setSubcategories(mainCats[0].subcategories);
            setSelectedSubcategory(mainCats[0].subcategories[0]);
          } else {
            setSubcategories([]);
            setSelectedSubcategory(null);
          }
        }
      } else {
        setSelectedMainCategory(null);
        setSubcategories([]);
        setSelectedSubcategory(null);
      }
    } catch (error) {
      console.error('Error loading gallery categories:', error);
      toast.error('Error loading gallery categories');
    } finally {
      setLoading(false);
    }
  };

  const handleMainCategoryChange = (category) => {
    setSelectedMainCategory(category);
    
    // Update subcategories based on the selected main category
    if (category && category.subcategories) {
      setSubcategories(category.subcategories);
      // Select first subcategory if available
      if (category.subcategories.length > 0) {
        setSelectedSubcategory(category.subcategories[0]);
      } else {
        setSelectedSubcategory(null);
      }
    } else {
      setSubcategories([]);
      setSelectedSubcategory(null);
    }
  };

  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategory(subcategory);
  };

  const handleCategoryFormChange = (e) => {
    setCategoryForm({ ...categoryForm, [e.target.name]: e.target.value });
  };

  const handleSubcategoryFormChange = (e) => {
    setSubcategoryForm({ ...subcategoryForm, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImageForm({ ...imageForm, [e.target.name]: e.target.value });
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/i)) {
        toast.error('Please select a valid image file (JPEG, PNG, or GIF)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit');
        return;
      }
      
      setImageForm({ ...imageForm, image: file });
      
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        console.log('Preview created');
      };
      reader.onerror = () => {
        console.error('Error creating preview');
        toast.error('Error creating image preview');
      };
      reader.readAsDataURL(file);
    } else {
      console.warn('No file selected');
    }
  };

  const handleMainCategorySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const categoryData = {
      ...categoryForm,
      isMainCategory: true
    };
    
    try {
      if (isEditing) {
        await galleryService.updateCategory(editingId, categoryData);
        toast.success('Main category updated successfully');
      } else {
        await galleryService.createCategory(categoryData);
        toast.success('Main category created successfully');
      }
      
      // Reset form and reload data
      setCategoryForm({ name: '', description: '', isMainCategory: true });
      setCategoryFormVisible(false);
      setIsEditing(false);
      setEditingId(null);
      await loadCategories();
    } catch (error) {
      console.error('Error saving main category:', error);
      toast.error(error.response?.data?.message || 'Error saving main category');
    } finally {
      setLoading(false);
    }
  };

  const handleSubcategorySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const subcategoryData = {
      ...subcategoryForm,
      isMainCategory: false,
      parentId: selectedMainCategory?.id
    };
    
    try {
      if (isEditing) {
        await galleryService.updateCategory(editingId, subcategoryData);
        toast.success('Subcategory updated successfully');
      } else {
        await galleryService.createCategory(subcategoryData);
        toast.success('Subcategory created successfully');
      }
      
      // Reset form and reload data
      setSubcategoryForm({ name: '', description: '', parentId: selectedMainCategory?.id });
      setSubcategoryFormVisible(false);
      setIsEditing(false);
      setEditingId(null);
      await loadCategories();
    } catch (error) {
      console.error('Error saving subcategory:', error);
      toast.error(error.response?.data?.message || 'Error saving subcategory');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    
    // Use the selected subcategory ID, or if none is selected, use the main category ID
    const targetCategoryId = selectedSubcategory ? selectedSubcategory.id : selectedMainCategory?.id;
    
    if (!targetCategoryId) {
      toast.error('Please select a category first');
      return;
    }
    
    // Check if trying to upload to a main category
    if (!selectedSubcategory && selectedMainCategory?.isMainCategory) {
      toast.error('Images can only be uploaded to subcategories. Please select a subcategory first.');
      return;
    }
    
    if (!isEditing && !imageForm.image) {
      toast.error('Please select an image');
      return;
    }
    
    setLoading(true);
    
    try {
      const formData = {
        ...imageForm,
        categoryId: targetCategoryId
      };
      
      if (isEditing) {
        await galleryService.updateImage(editingId, formData);
        toast.success('Image updated successfully');
      } else {
        const response = await galleryService.createImage(formData);
        console.log('Image creation response:', response);
        toast.success('Image uploaded successfully');
      }
      
      // Reset form and reload data
      setImageForm({ alt: '', caption: '', image: null, categoryId: targetCategoryId });
      setImageFormVisible(false);
      setIsEditing(false);
      setEditingId(null);
      setImagePreview(null);
      
      // Debug log before reloading categories
      console.log('About to reload categories after image upload/edit');
      await loadCategories();
      console.log('Categories reloaded. Current subcategory:', selectedSubcategory);
      
      // If there's a subcategory selected, verify its images
      if (selectedSubcategory) {
        console.log('Selected subcategory images:', selectedSubcategory.images);
      }
    } catch (error) {
      console.error('Error saving image:', error);
      toast.error(error.response?.data?.message || 'Error saving image');
    } finally {
      setLoading(false);
    }
  };

  const editMainCategory = (category) => {
    setCategoryForm({
      name: category.name,
      description: category.description,
      isMainCategory: true
    });
    setIsEditing(true);
    setEditingId(category.id);
    setCategoryFormVisible(true);
  };

  const editSubcategory = (category) => {
    setSubcategoryForm({
      name: category.name,
      description: category.description,
      parentId: category.parentId || selectedMainCategory?.id
    });
    setIsEditing(true);
    setEditingId(category.id);
    setSubcategoryFormVisible(true);
  };

  const editImage = (image) => {
    setImageForm({
      alt: image.alt || '',
      caption: image.caption || '',
      categoryId: image.category.id
    });
    setIsEditing(true);
    setEditingId(image.id);
    setImageFormVisible(true);
  };

  const deleteMainCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this main category? All subcategories and images will also be deleted.')) {
      return;
    }
    
    setLoading(true);
    
    try {
      await galleryService.deleteCategory(id);
      toast.success('Main category deleted successfully');
      
      // Update the UI
      await loadCategories();
      if (selectedMainCategory && selectedMainCategory.id === id) {
        setSelectedMainCategory(null);
        setSelectedSubcategory(null);
        setSubcategories([]);
      }
    } catch (error) {
      console.error('Error deleting main category:', error);
      toast.error(error.response?.data?.message || 'Error deleting main category');
    } finally {
      setLoading(false);
    }
  };

  const deleteSubcategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subcategory? All images in this subcategory will also be deleted.')) {
      return;
    }
    
    setLoading(true);
    
    try {
      await galleryService.deleteCategory(id);
      toast.success('Subcategory deleted successfully');
      
      // Update the UI
      await loadCategories();
      if (selectedSubcategory && selectedSubcategory.id === id) {
        setSelectedSubcategory(null);
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast.error(error.response?.data?.message || 'Error deleting subcategory');
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      await galleryService.deleteImage(id);
      toast.success('Image deleted successfully');
      
      // Refresh the data
      await loadCategories();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error(error.response?.data?.message || 'Error deleting image');
    } finally {
      setLoading(false);
    }
  };

  // Render functions for UI elements
  const renderMainCategoriesList = () => {
    return (
      <div className="categories-section">
        <div className="section-header">
          <h3>Main Categories</h3>
          <button 
            className="add-button"
            onClick={() => {
              setCategoryForm({ name: '', description: '', isMainCategory: true });
              setIsEditing(false);
              setCategoryFormVisible(true);
            }}
          >
            <FaPlus /> Add Main Category
          </button>
        </div>
        
        <div className="categories-note">
          <small>Note: First select a main category, then a subcategory before uploading images.</small>
        </div>
        
        <div className="categories-list">
          {mainCategories.map(category => (
            <div 
              key={category.id}
              className={`category-item ${selectedMainCategory?.id === category.id ? 'selected' : ''}`}
              onClick={() => handleMainCategoryChange(category)}
            >
              <span className="category-name">{category.name}</span>
              <div className="category-actions">
                <button 
                  className="edit-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    editMainCategory(category);
                  }}
                >
                  <FaEdit />
                </button>
                <button 
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMainCategory(category.id);
                  }}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSubcategoriesList = () => {
    if (!selectedMainCategory) return null;
    
    return (
      <div className="subcategories-section">
        <div className="section-header">
          <h3>Subcategories for {selectedMainCategory.name}</h3>
          <button 
            className="add-button"
            onClick={() => {
              setSubcategoryForm({ name: '', description: '', parentId: selectedMainCategory.id });
              setIsEditing(false);
              setSubcategoryFormVisible(true);
            }}
          >
            <FaPlus /> Add Subcategory
          </button>
        </div>
        
        <div className="categories-note">
          <small>Select a subcategory below to upload images. Images can only be uploaded to subcategories.</small>
        </div>
        
        <div className="categories-list">
          {subcategories.map(subcategory => (
            <div 
              key={subcategory.id}
              className={`category-item ${selectedSubcategory?.id === subcategory.id ? 'selected' : ''}`}
              onClick={() => handleSubcategoryChange(subcategory)}
            >
              <span className="category-name">{subcategory.name}</span>
              <div className="category-actions">
                <button 
                  className="edit-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    editSubcategory(subcategory);
                  }}
                >
                  <FaEdit />
                </button>
                <button 
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSubcategory(subcategory.id);
                  }}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderImages = () => {
    const currentCategory = selectedSubcategory || selectedMainCategory;
    if (!currentCategory) return null;
    
    // Get up-to-date images array
    let images = [];
    
    if (selectedSubcategory) {
      // If a subcategory is selected, check for its images
      console.log('Getting images for subcategory:', selectedSubcategory.id);
      images = selectedSubcategory.images || [];
      console.log('Found images count:', images.length);
    } else if (selectedMainCategory) {
      // If only a main category is selected, get its images
      console.log('Getting images for main category:', selectedMainCategory.id);
      images = selectedMainCategory.images || [];
      console.log('Found images count:', images.length);
    }
    
    return (
      <div className="images-section">
        <div className="section-header">
          <h3>Images in "{currentCategory.name}"</h3>
          <button 
            className="add-button"
            onClick={() => {
              // Only allow uploads to subcategories
              if (!selectedSubcategory && currentCategory.isMainCategory) {
                toast.warning('Please select a subcategory first. Images can only be uploaded to subcategories.');
                return;
              }
              setImageForm({ alt: '', caption: '', image: null, categoryId: currentCategory.id });
              setIsEditing(false);
              setImagePreview(null);
              setImageFormVisible(true);
            }}
          >
            <FaUpload /> Upload Image
          </button>
        </div>
        
        <div className="images-grid">
          {images.length === 0 ? (
            <div className="no-images-message">
              <p>No images found. {!selectedSubcategory ? 'Select a subcategory and upload images.' : 'Upload some images to get started.'}</p>
            </div>
          ) : (
            images.map((image, imageIndex) => (
              <div key={image.id} className="image-card">
                <img src={image.src} alt={image.alt || 'Gallery image'} />
                <div className="image-caption">{image.caption || image.alt || ''}</div>
                <div className="image-actions">
                  <button 
                    className="edit-button"
                    onClick={() => editImage(image)}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => deleteImage(image.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderMainCategoryForm = () => {
    if (!categoryFormVisible) return null;
    
    return (
      <div className="form-overlay">
        <div className="form-container">
          <h3>{isEditing ? 'Edit Main Category' : 'Add Main Category'}</h3>
          <form onSubmit={handleMainCategorySubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={categoryForm.name}
                onChange={handleCategoryFormChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={categoryForm.description}
                onChange={handleCategoryFormChange}
                required
              ></textarea>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setCategoryFormVisible(false);
                  setCategoryForm({ name: '', description: '', isMainCategory: true });
                  setIsEditing(false);
                  setEditingId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderSubcategoryForm = () => {
    if (!subcategoryFormVisible) return null;
    
    return (
      <div className="form-overlay">
        <div className="form-container">
          <h3>{isEditing ? 'Edit Subcategory' : 'Add Subcategory'}</h3>
          <form onSubmit={handleSubcategorySubmit}>
            <div className="form-group">
              <label htmlFor="subName">Name</label>
              <input
                type="text"
                id="subName"
                name="name"
                value={subcategoryForm.name}
                onChange={handleSubcategoryFormChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="subDescription">Description</label>
              <textarea
                id="subDescription"
                name="description"
                value={subcategoryForm.description}
                onChange={handleSubcategoryFormChange}
                required
              ></textarea>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setSubcategoryFormVisible(false);
                  setSubcategoryForm({ name: '', description: '', parentId: selectedMainCategory?.id });
                  setIsEditing(false);
                  setEditingId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderImageForm = () => {
    if (!imageFormVisible) return null;
    
    return (
      <div className="form-overlay">
        <div className="form-container">
          <h3>{isEditing ? 'Edit Image' : 'Upload New Image'}</h3>
          <form onSubmit={handleImageSubmit}>
            {!isEditing && (
              <div className="form-group">
                <label htmlFor="image">Image File</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleImageFileChange}
                  required={!isEditing}
                />
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="alt">Alt Text</label>
              <input
                type="text"
                id="alt"
                name="alt"
                value={imageForm.alt}
                onChange={handleImageChange}
                placeholder="Brief description of the image"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="caption">Caption</label>
              <textarea
                id="caption"
                name="caption"
                value={imageForm.caption}
                onChange={handleImageChange}
                placeholder="Optional image caption"
              ></textarea>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setImageFormVisible(false);
                  setImageForm({ alt: '', caption: '', image: null, categoryId: '' });
                  setIsEditing(false);
                  setEditingId(null);
                  setImagePreview(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="gallery-manager">
      <h2>Gallery Manager</h2>
      
      <div className="gallery-grid">
        <div className="categories-container">
          {renderMainCategoriesList()}
          {renderSubcategoriesList()}
        </div>
        
        <div className="images-container">
          {renderImages()}
        </div>
      </div>
      
      {renderMainCategoryForm()}
      {renderSubcategoryForm()}
      {renderImageForm()}
    </div>
  );
};

export default GalleryManager; 
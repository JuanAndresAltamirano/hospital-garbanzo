import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-toastify';
import TimelineForm from './TimelineForm';
import timelineService from '../../services/timelineService';
import './TimelineManager.css';

// Get base URL without /api for image loading
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const TimelineManager = () => {
  const [timelines, setTimelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState(null);

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

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(timelines);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTimelines(items);

    try {
      await timelineService.updateOrder(items.map(item => item.id));
      toast.success('Orden actualizado correctamente');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Error al actualizar el orden');
      fetchTimelines(); // Revert to original order
    }
  };

  const handleEdit = (timeline) => {
    setEditingTimeline(timeline);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este elemento?')) {
      return;
    }

    try {
      await timelineService.delete(id);
      setTimelines(timelines.filter(timeline => timeline.id !== id));
      toast.success('Elemento eliminado correctamente');
    } catch (error) {
      console.error('Error deleting timeline:', error);
      toast.error('Error al eliminar el elemento');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const savedTimeline = editingTimeline
        ? await timelineService.update(editingTimeline.id, formData)
        : await timelineService.create(formData);
      
      if (editingTimeline) {
        setTimelines(timelines.map(timeline =>
          timeline.id === editingTimeline.id ? savedTimeline : timeline
        ));
        toast.success('Elemento actualizado correctamente');
      } else {
        setTimelines([...timelines, savedTimeline]);
        toast.success('Elemento creado correctamente');
      }
      
      setShowForm(false);
      setEditingTimeline(null);
    } catch (error) {
      console.error('Error saving timeline:', error);
      toast.error('Error al guardar el elemento');
    }
  };

  // Helper function to get the correct image URL
  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    return `${BASE_URL}/uploads/${imageName}`;
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="timeline-manager">
      <div className="timeline-manager-header">
        <h1>Gestión de Línea de Tiempo</h1>
        <button
          className="add-button"
          onClick={() => {
            setEditingTimeline(null);
            setShowForm(true);
          }}
        >
          Agregar Nuevo Elemento
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <TimelineForm
            timeline={editingTimeline}
            onSubmit={handleFormSubmit}
            onClose={() => {
              setShowForm(false);
              setEditingTimeline(null);
            }}
          />
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="timelines">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="timelines-list"
            >
              {timelines.map((timeline, index) => (
                <Draggable
                  key={timeline.id}
                  draggableId={timeline.id.toString()}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="timeline-item"
                    >
                      <div className="timeline-content">
                        <div className="timeline-image">
                          {timeline.image ? (
                            <img
                              src={getImageUrl(timeline.image)}
                              alt={timeline.title}
                              onError={(e) => {
                                console.error('Image failed to load:', e.target.src);
                                console.log('Image details:', timeline.image);
                                e.target.onerror = null; // Prevent infinite loop
                                e.target.src = '/placeholder-image.jpg';
                              }}
                            />
                          ) : (
                            <div className="placeholder-image">
                              <span>No Image</span>
                            </div>
                          )}
                        </div>
                        <div className="timeline-details">
                          <div className="timeline-year">{timeline.year}</div>
                          <h3>{timeline.title}</h3>
                          <p>{timeline.description}</p>
                        </div>
                        <div className="timeline-actions">
                          <button
                            className="edit-button"
                            onClick={() => handleEdit(timeline)}
                          >
                            Editar
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDelete(timeline.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default TimelineManager; 
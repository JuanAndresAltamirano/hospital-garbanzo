import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaEdit, FaTrash, FaGripVertical } from 'react-icons/fa';
import { toast } from 'react-toastify';
import PromotionForm from './PromotionForm';
import { promotionsService } from '../../services/promotionsService';
import './PromotionsManager.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const SortableItem = ({ id, promotion, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="promotion-item">
      <div className="drag-handle" {...attributes} {...listeners}>
        <FaGripVertical />
      </div>
      <div className="promotion-image">
        <img
          src={`${API_URL}/uploads/${promotion.image.split('/').pop()}`}
          alt={promotion.title}
        />
      </div>
      <div className="promotion-info">
        <h3>{promotion.title}</h3>
        <p>{promotion.description}</p>
        <p className="valid-until">
          Válido hasta: {new Date(promotion.endDate).toLocaleDateString()}
        </p>
      </div>
      <div className="promotion-actions">
        <button
          className="btn-icon"
          onClick={() => onEdit(promotion)}
          title="Editar"
        >
          <FaEdit />
        </button>
        <button
          className="btn-icon delete"
          onClick={() => onDelete(promotion.id)}
          title="Eliminar"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

const PromotionsManager = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const data = await promotionsService.getAll();
      setPromotions(data);
    } catch (error) {
      toast.error('Error al cargar las promociones');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setPromotions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        
        // Update order in backend
        const orderData = newArray.map((item, index) => ({
          id: item.id,
          displayOrder: index,
        }));
        
        promotionsService.reorder(orderData)
          .catch((error) => {
            console.error("Error updating order:", error);
            toast.error("Error al actualizar el orden");
          });

        return newArray;
      });
    }
  };

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta promoción?')) return;

    try {
      await promotionsService.delete(id);
      toast.success('Promoción eliminada exitosamente');
      fetchPromotions();
    } catch (error) {
      toast.error('Error al eliminar la promoción');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingPromotion) {
        await promotionsService.update(editingPromotion.id, formData);
        toast.success('Promoción actualizada exitosamente');
      } else {
        await promotionsService.create(formData);
        toast.success('Promoción creada exitosamente');
      }
      setShowForm(false);
      setEditingPromotion(null);
      fetchPromotions();
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al guardar la promoción';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  if (loading) {
    return <div className="loading">Cargando promociones...</div>;
  }

  return (
    <div className="promotions-manager">
      <div className="manager-header">
        <h2>Gestionar Promociones</h2>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingPromotion(null);
            setShowForm(true);
          }}
        >
          Nueva Promoción
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <PromotionForm
              promotion={editingPromotion}
              onSubmit={handleFormSubmit}
              onClose={() => {
                setShowForm(false);
                setEditingPromotion(null);
              }}
            />
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={promotions.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="promotions-list">
            {promotions.map((promotion) => (
              <SortableItem
                key={promotion.id}
                id={promotion.id}
                promotion={promotion}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default PromotionsManager; 
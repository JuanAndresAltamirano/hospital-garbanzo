import { useState, useEffect } from "react";
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
import { FaEdit, FaTrash, FaGripVertical } from "react-icons/fa";
import { toast } from "react-toastify";
import { historyService } from "../../services/historyService";
import "./HistoryManager.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const SortableItem = ({ id, history, onEdit, onDelete }) => {
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
    <div ref={setNodeRef} style={style} className="history-item">
      <div className="drag-handle" {...attributes} {...listeners}>
        <FaGripVertical />
      </div>
      <div className="history-image">
        <img
          src={`${API_URL}/uploads/${history.image ? history.image.split('/').pop() : ''}`}
          alt={history.title}
          onError={(e) => {
            e.target.src = '/placeholder-image.jpg';
          }}
        />
      </div>
      <div className="history-info">
        <h3>{history.year}</h3>
        <h4>{history.title}</h4>
        <p>{history.description}</p>
      </div>
      <div className="history-actions">
        <button onClick={() => onEdit(history)} className="btn-icon">
          <FaEdit />
        </button>
        <button onClick={() => onDelete(history.id)} className="btn-icon delete">
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

const HistoryManager = () => {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHistory, setEditingHistory] = useState(null);
  const [formData, setFormData] = useState({
    year: "",
    title: "",
    description: "",
    image: null,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchHistory = async () => {
    try {
      const data = await historyService.getAll();
      setHistoryItems(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Error al cargar la historia");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setHistoryItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        
        // Update order in backend
        const orderData = newArray.map((item, index) => ({
          id: item.id,
          displayOrder: index,
        }));
        
        historyService.updateOrder(orderData)
          .catch((error) => {
            console.error("Error updating order:", error);
            toast.error("Error al actualizar el orden");
          });

        return newArray;
      });
    }
  };

  const handleEdit = (history) => {
    setEditingHistory(history);
    setFormData({
      year: history.year,
      title: history.title,
      description: history.description,
      image: null,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de que desea eliminar este elemento de la historia?")) {
      try {
        await historyService.delete(id);
        toast.success("Elemento de historia eliminado exitosamente");
        fetchHistory();
      } catch (error) {
        console.error("Error deleting history item:", error);
        toast.error("Error al eliminar el elemento de historia");
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === 'image' && formData[key]) {
        formDataToSend.append('image', formData[key]);
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      if (editingHistory) {
        await historyService.update(editingHistory.id, formDataToSend);
        toast.success("Elemento de historia actualizado exitosamente");
      } else {
        await historyService.create(formDataToSend);
        toast.success("Elemento de historia creado exitosamente");
      }
      setShowForm(false);
      setEditingHistory(null);
      setFormData({
        year: "",
        title: "",
        description: "",
        image: null,
      });
      fetchHistory();
    } catch (error) {
      console.error("Error saving history item:", error);
      toast.error("Error al guardar el elemento de historia");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  if (loading) {
    return <div className="loading">Cargando historia...</div>;
  }

  return (
    <div className="history-manager">
      <div className="manager-header">
        <h2>Gestionar Historia</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          Agregar Nuevo Elemento
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingHistory ? "Editar Elemento de Historia" : "Agregar Nuevo Elemento"}</h3>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Año:</label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Título:</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Imagen:</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleImageChange}
                />
                {editingHistory && (
                  <small className="help-text">Deja vacío para mantener la imagen actual</small>
                )}
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingHistory ? "Actualizar" : "Crear"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingHistory(null);
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={historyItems.map((history) => history.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="history-list">
            {historyItems.map((history) => (
              <SortableItem
                key={history.id}
                id={history.id}
                history={history}
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

export default HistoryManager; 
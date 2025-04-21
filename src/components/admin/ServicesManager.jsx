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
import ServiceForm from './ServiceForm';
import { servicesService } from "../../services/servicesService";
import "./ServicesManager.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const SortableItem = ({ id, service, onEdit, onDelete }) => {
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
    <div ref={setNodeRef} style={style} className="service-item">
      <div className="drag-handle" {...attributes} {...listeners}>
        <FaGripVertical />
      </div>
      <div className="service-image">
        <img
          src={service.image ? `${API_URL.replace('/api', '')}/uploads/${service.image.split('/').pop()}` : '/placeholder-image.jpg'}
          alt={service.name}
          onError={(e) => {
            e.target.src = '/placeholder-image.jpg';
          }}
        />
      </div>
      <div className="service-info">
        <h3>{service.name}</h3>
        <p>{service.description}</p>
        <p className="price">
          Precio: ${service.price}
        </p>
      </div>
      <div className="service-actions">
        <button
          className="btn-icon"
          onClick={() => onEdit(service)}
          title="Editar"
        >
          <FaEdit />
        </button>
        <button
          className="btn-icon delete"
          onClick={() => onDelete(service.id)}
          title="Eliminar"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

const ServicesManager = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [error, setError] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchServices = async () => {
    try {
      const data = await servicesService.getAll();
      setServices(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Error al cargar los servicios");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setServices((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        
        // Update order in backend
        const orderData = newArray.map((item, index) => ({
          id: item.id,
          displayOrder: index,
        }));
        
        servicesService.updateOrder(orderData)
          .catch((error) => {
            console.error("Error updating order:", error);
            toast.error("Error al actualizar el orden");
          });

        return newArray;
      });
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este servicio?")) {
      try {
        await servicesService.delete(id);
        setServices(services.filter(service => service.id !== id));
        toast.success("Servicio eliminado exitosamente");
      } catch (error) {
        console.error("Error deleting service:", error);
        toast.error("Error al eliminar el servicio");
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setError(null);
      
      if (editingService) {
        await servicesService.update(editingService.id, formData);
        setServices(services.map(service => 
          service.id === editingService.id ? { ...service, ...formData } : service
        ));
        toast.success("Servicio actualizado exitosamente");
      } else {
        const newService = await servicesService.create(formData);
        setServices([...services, newService]);
        toast.success("Servicio creado exitosamente");
      }
      setShowForm(false);
      setEditingService(null);
    } catch (error) {
      console.error("Error saving service:", error);
      
      // Display validation errors if available
      if (error.response && error.response.data && error.response.data.message) {
        const errorMessages = Array.isArray(error.response.data.message) 
          ? error.response.data.message 
          : [error.response.data.message];
        
        setError(errorMessages);
        toast.error("Por favor, corrija los errores en el formulario");
      } else {
        toast.error("Error al guardar el servicio");
      }
    }
  };

  if (loading) {
    return <div className="loading">Cargando servicios...</div>;
  }

  return (
    <div className="services-manager">
      <div className="manager-header">
        <h2>Gestionar Servicios</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          Agregar Nuevo Servicio
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            {error && (
              <div className="error-container">
                <h3>Errores de validación:</h3>
                <ul>
                  {error.map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
            <ServiceForm
              service={editingService}
              onSubmit={handleFormSubmit}
              onClose={() => {
                setShowForm(false);
                setEditingService(null);
                setError(null);
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
          items={services.map(service => service.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="services-list">
            {services.map((service) => (
              <SortableItem
                key={service.id}
                id={service.id}
                service={service}
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

export default ServicesManager; 
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
import axios from "axios";
import { toast } from "react-toastify";
import "./SpecialistsManager.css";

const SortableItem = ({ id, specialist, onEdit, onDelete }) => {
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
    <div ref={setNodeRef} style={style} className="specialist-item">
      <div className="drag-handle" {...attributes} {...listeners}>
        <FaGripVertical />
      </div>
      <div className="specialist-info">
        <h3>{specialist.name}</h3>
        <p><strong>Specialty:</strong> {specialist.specialty}</p>
        <p>{specialist.bio}</p>
      </div>
      <div className="specialist-actions">
        <button onClick={() => onEdit(specialist)} className="btn-icon">
          <FaEdit />
        </button>
        <button onClick={() => onDelete(specialist.id)} className="btn-icon delete">
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

const SpecialistsManager = () => {
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSpecialist, setEditingSpecialist] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    bio: "",
    image_url: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchSpecialists = async () => {
    try {
      const response = await axios.get("/backend/api/specialists.php");
      setSpecialists(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching specialists:", error);
      toast.error("Error loading specialists");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialists();
  }, []);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSpecialists((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        
        // Update order in backend
        const orderData = newArray.map((item, index) => ({
          id: item.id,
          display_order: index,
        }));
        
        axios.post("/backend/api/specialists.php/reorder", orderData)
          .catch((error) => {
            console.error("Error updating order:", error);
            toast.error("Error updating order");
          });

        return newArray;
      });
    }
  };

  const handleEdit = (specialist) => {
    setEditingSpecialist(specialist);
    setFormData({
      name: specialist.name,
      specialty: specialist.specialty,
      bio: specialist.bio,
      image_url: specialist.image_url,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this specialist?")) {
      try {
        await axios.delete(`/backend/api/specialists.php?id=${id}`);
        toast.success("Specialist deleted successfully");
        fetchSpecialists();
      } catch (error) {
        console.error("Error deleting specialist:", error);
        toast.error("Error deleting specialist");
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    try {
      if (editingSpecialist) {
        await axios.post(`/backend/api/specialists.php?id=${editingSpecialist.id}`, formDataToSend);
        toast.success("Specialist updated successfully");
      } else {
        await axios.post("/backend/api/specialists.php", formDataToSend);
        toast.success("Specialist created successfully");
      }
      setShowForm(false);
      setEditingSpecialist(null);
      setFormData({
        name: "",
        specialty: "",
        bio: "",
        image_url: "",
      });
      fetchSpecialists();
    } catch (error) {
      console.error("Error saving specialist:", error);
      toast.error("Error saving specialist");
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="specialists-manager">
      <div className="manager-header">
        <h2>Manage Specialists</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          Add New Specialist
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingSpecialist ? "Edit Specialist" : "Add New Specialist"}</h3>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Specialty:</label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) =>
                    setFormData({ ...formData, specialty: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Bio:</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Image URL:</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingSpecialist ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSpecialist(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
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
          items={specialists.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="specialists-list">
            {specialists.map((specialist) => (
              <SortableItem
                key={specialist.id}
                id={specialist.id}
                specialist={specialist}
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

export default SpecialistsManager; 
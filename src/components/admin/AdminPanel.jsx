import { useState } from 'react';
import { FaUsers, FaTag, FaHistory, FaSignOutAlt, FaImages } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import PromotionsManager from './PromotionsManager';
import ServicesManager from './ServicesManager';
import HistoryManager from './HistoryManager';
import GalleryManager from './GalleryManager';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState('promotions');
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'promotions':
        return <PromotionsManager />;
      case 'services':
        return <ServicesManager />;
      case 'history':
        return <HistoryManager />;
      case 'gallery':
        return <GalleryManager />;
      default:
        return <PromotionsManager />;
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-sidebar">
        <div className="admin-header">
          <h2>Panel de Administración</h2>
        </div>
        <nav className="admin-nav">
          <button
            className={`nav-item ${activeSection === 'promotions' ? 'active' : ''}`}
            onClick={() => setActiveSection('promotions')}
          >
            <FaTag />
            <span>Promociones</span>
          </button>
          <button
            className={`nav-item ${activeSection === 'services' ? 'active' : ''}`}
            onClick={() => setActiveSection('services')}
          >
            <FaUsers />
            <span>Servicios</span>
          </button>
          <button
            className={`nav-item ${activeSection === 'history' ? 'active' : ''}`}
            onClick={() => setActiveSection('history')}
          >
            <FaHistory />
            <span>Historia</span>
          </button>
          <button
            className={`nav-item ${activeSection === 'gallery' ? 'active' : ''}`}
            onClick={() => setActiveSection('gallery')}
          >
            <FaImages />
            <span>Galería</span>
          </button>
        </nav>
        <div className="admin-footer">
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
      <div className="admin-content">
        {renderSection()}
      </div>
    </div>
  );
};

export default AdminPanel; 
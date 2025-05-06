import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaInfoCircle, FaPhone, FaBriefcaseMedical, FaTimes } from 'react-icons/fa';
import logo from '../../assets/logo.png';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isAuthenticated = localStorage.getItem('adminToken');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Handle body scroll lock when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('no-scroll');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('no-scroll');
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('no-scroll');
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { path: '/', label: 'Inicio', icon: <FaHome className="nav-icon-svg" /> },
    { path: '/servicios', label: 'Servicios', icon: <FaBriefcaseMedical className="nav-icon-svg" /> },
    { path: '/nosotros', label: 'Sobre Nosotros', icon: <FaInfoCircle className="nav-icon-svg" /> },
    { path: '/contacto', label: 'Contacto', icon: <FaPhone className="nav-icon-svg" /> }
  ];

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''} ${isMenuOpen ? 'menu-open' : ''}`}>
      <div className="header-content">
        <Link to="/" className="logo-container">
          <img src={logo} alt="Centro de Especialidades Médicas DR. MARCO VINICIO MULLO" className="logo" />
        </Link>
        
        <button 
          className={`mobile-menu-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isMenuOpen ? (
            <FaTimes className="hamburger-icon" />
          ) : (
            <div className="hamburger-icon">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </button>
        
        <nav className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <div className="mobile-menu-header">
            <img src={logo} alt="Logo" className="mobile-menu-logo" />
          </div>
          
          {menuItems.map((item, index) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={location.pathname === item.path || 
                (item.path !== '/' && location.pathname.includes(item.path)) 
                ? 'active' : ''}
              style={{ '--index': index }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        
        {/*
        <div className="auth-buttons">
          {isAuthenticated ? (
            <>
              <Link to="/admin">Admin</Link>
              <button onClick={() => {
                localStorage.removeItem('adminToken');
                window.location.href = '/admin';
              }} className="logout-btn">
                Cerrar Sesión
              </button>
            </>
          ) : (
            <Link to="/login" className="login-btn">Iniciar Sesión</Link>
          )}
        </div>
        */}
      </div>
    </header>
  );
};

export default Header; 
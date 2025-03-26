import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="header">
      <div className="container header-container">
        <Link to="/" className="logo">
          <h1>Clínica Mullo</h1>
        </Link>

        <button className="mobile-menu" onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>

        <nav className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link">Inicio</Link>
          <Link to="/services" className="nav-link">Servicios</Link>
          <Link to="/specialists" className="nav-link">Especialistas</Link>
          <Link to="/history" className="nav-link">Historia</Link>
          <Link to="/promotions" className="nav-link">Promociones</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header; 
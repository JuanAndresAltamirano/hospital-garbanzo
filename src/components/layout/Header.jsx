import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import './Header.css';

const Header = () => {
  const isAuthenticated = localStorage.getItem('adminToken');

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo-container">
          <img src={logo} alt="Centro de Especialidades Médicas DR. MARCO VINICIO MULLO" className="logo" />
        </Link>
        <nav className="nav-links">
          <Link to="/">Inicio</Link>
          <Link to="/services">Servicios</Link>
          <Link to="/specialists">Especialistas</Link>
          <Link to="/history">Historia</Link>
          <Link to="/promotions">Promociones</Link>
          <Link to="/contact">Contacto</Link>
        </nav>
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
      </div>
    </header>
  );
};

export default Header; 
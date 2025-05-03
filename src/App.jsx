import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Specialists from './pages/Specialists';
import History from './pages/History';
import Promotions from './pages/Promotions';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import PasswordRecovery from './pages/PasswordRecovery';
import PasswordReset from './pages/PasswordReset';
import './styles/globals.css';

// Redirect component for services
function ServiceRedirect() {
  const { id } = useParams();
  return <Navigate to={`/servicios/${id}`} replace />;
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="app">
      {!isAdminRoute && <Header />}
      <main className={`main-content ${isAdminRoute ? 'admin-page' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/servicios/:id" element={<ServiceDetail />} />
          <Route path="/especialistas" element={<Specialists />} />
          <Route path="/nosotros" element={<History />} />
          <Route path="/promociones" element={<Promotions />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/recuperar-contrasena" element={<PasswordRecovery />} />
          <Route path="/restablecer-contrasena" element={<PasswordReset />} />
          
          {/* Redirects for English routes to Spanish routes */}
          <Route path="/services/:id" element={<ServiceRedirect />} />
        </Routes>
      </main>
      <ToastContainer position="bottom-right" />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;

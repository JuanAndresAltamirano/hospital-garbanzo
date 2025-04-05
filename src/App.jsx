import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Services from './pages/Services';
import Specialists from './pages/Specialists';
import History from './pages/History';
import Promotions from './pages/Promotions';
import Admin from './pages/Admin';
import PasswordRecovery from './pages/PasswordRecovery';
import PasswordReset from './pages/PasswordReset';
import './styles/globals.css';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="app">
      {!isAdminRoute && <Header />}
      <main className={`main-content ${isAdminRoute ? 'admin-page' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/specialists" element={<Specialists />} />
          <Route path="/history" element={<History />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/forgot-password" element={<PasswordRecovery />} />
          <Route path="/reset-password" element={<PasswordReset />} />
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

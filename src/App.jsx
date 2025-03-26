import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Services from './pages/Services';
import Specialists from './pages/Specialists';
import History from './pages/History';
import Promotions from './pages/Promotions';
import Admin from './pages/Admin';
import './styles/globals.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/specialists" element={<Specialists />} />
            <Route path="/history" element={<History />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

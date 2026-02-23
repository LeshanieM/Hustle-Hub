import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Homepage from './pages/Homepage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* ===== PUBLIC ROUTES ===== */}

        <Route path="/" element={<Homepage />} />

        {/* ===== CUSTOMER ROUTES ===== */}

        {/* ===== OWNER ROUTES ===== */}


        {/* ===== ADMIN ROUTES ===== */}
        

        {/* ===== 404 NOT FOUND ===== */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;

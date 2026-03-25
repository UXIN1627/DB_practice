import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import MainMenu from './pages/MainMenu';
import CustPage from './pages/CustPage';
import FactPage from './pages/FactPage';
import ItemPage from './pages/ItemPage';
import UserPage from './pages/UserPage';

function PrivateRoute({ children }) {
  const user = sessionStorage.getItem('user');
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><MainMenu /></PrivateRoute>} />
        <Route path="/cust" element={<PrivateRoute><CustPage /></PrivateRoute>} />
        <Route path="/fact" element={<PrivateRoute><FactPage /></PrivateRoute>} />
        <Route path="/item" element={<PrivateRoute><ItemPage /></PrivateRoute>} />
        <Route path="/user" element={<PrivateRoute><UserPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

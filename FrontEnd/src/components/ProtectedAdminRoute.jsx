// src/components/ProtectedAdminRoute.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }

    const user = JSON.parse(currentUser);
    
    if (user.role !== 'admin') {
      alert('Access denied. Admin only area.');
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) return null;
  
  const user = JSON.parse(currentUser);
  if (user.role !== 'admin') return null;

  return children;
};

export default ProtectedAdminRoute;
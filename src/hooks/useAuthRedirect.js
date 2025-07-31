import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useAuthRedirect = () => {
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Si no está autenticado y no está cargando, redirigir a login
    if (!loading && !isAuthenticated()) {
      window.location.href = '/login';
    }
  }, [loading, isAuthenticated]);

  return { loading, isAuthenticated: isAuthenticated() };
}; 
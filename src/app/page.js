'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '../components/layout/Navigation';
import MainContent from '../components/features/MainContent';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { useAuthRedirect } from '../hooks/useAuthRedirect';

export default function Home() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { user } = useAuth();
  const { loading, isAuthenticated } = useAuthRedirect();

  // Verificar si hay un parámetro de sección en la URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    if (section) {
      setActiveSection(section);
      // Limpiar la URL
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // Mostrar spinner mientras verifica autenticación
  if (loading) {
    return <LoadingSpinner message="Verificando autenticación..." />;
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        user={user}
      />
      
      <MainContent activeSection={activeSection} />
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '../components/common/Navigation';
import Dashboard from '../components/common/Dashboard';
import UserList from '../components/modules/UserList';
import TruckList from '../components/modules/TruckList';
import ClientList from '../components/modules/ClientList';
import DiaEntregaList from '../components/modules/DiaEntregaList';
import RepartoList from '../components/modules/RepartoList';
import ClientesporRepartoList from '../components/modules/ClientesporRepartoList';
import ConfiguracionPage from './configuracion/page';
import { Container, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { user, loading, isAuthenticated } = useAuth();

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

  useEffect(() => {
    // Si no está autenticado y no está cargando, redirigir a login
    if (!loading && !isAuthenticated()) {
      window.location.href = '/login';
    }
  }, [loading, isAuthenticated]);

  // Mostrar spinner mientras verifica autenticación
  if (loading) {
    return (
      <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <div className="mt-3 text-muted">Verificando autenticación...</div>
        </div>
      </Container>
    );
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated()) {
    return null;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return (
          <Container className="py-4">
            <h2 className="mb-4">👥 Gestión de Usuarios</h2>
            <UserList />
          </Container>
        );
      case 'trucks':
        return (
          <Container className="py-4">
            <h2 className="mb-4">🚛 Gestión de Camiones</h2>
            <TruckList />
          </Container>
        );
      case 'clients':
        return (
          <Container className="py-4">
            <h2 className="mb-4">👥 Gestión de Clientes</h2>
            <ClientList />
          </Container>
        );
      case 'diasEntrega':
        return (
          <Container className="py-4">
            <h2 className="mb-4">📅 Días de Entrega</h2>
            <DiaEntregaList />
          </Container>
        );
      case 'repartos':
        return (
          <Container className="py-4">
            <h2 className="mb-4">📦 Gestión de Repartos</h2>
            <RepartoList />
          </Container>
        );
      case 'clientesporreparto':
        return (
          <Container className="py-4">
            <h2 className="mb-4">🎯 Asignaciones Cliente-Reparto</h2>
            <ClientesporRepartoList />
          </Container>
        );
      case 'configuracion':
        return <ConfiguracionPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        user={user}
      />
      
      <main className="pt-4">
        {renderContent()}
      </main>
    </div>
  );
}

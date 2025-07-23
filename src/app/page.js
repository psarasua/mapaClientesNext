'use client';

import React, { useState } from 'react';
import Navigation from '../components/common/Navigation';
import Dashboard from '../components/common/Dashboard';
import UserList from '../components/modules/UserList';
import TruckList from '../components/modules/TruckList';
import ClientList from '../components/modules/ClientList';
import DiaEntregaList from '../components/modules/DiaEntregaList';
import RepartoList from '../components/modules/RepartoList';
import ClientesporRepartoList from '../components/modules/ClientesporRepartoList';
import ConfiguracionPage from './configuracion/page';
import { Container } from 'react-bootstrap';

export default function Home() {
  const [activeSection, setActiveSection] = useState('dashboard');

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
      <Navigation activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <main className="pt-4">
        {renderContent()}
      </main>
    </div>
  );
}

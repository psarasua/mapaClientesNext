import React from 'react';
import { Container } from 'react-bootstrap';
import Dashboard from './Dashboard';

import {
  LazyUserListComponent,
  LazyTruckListComponent,
  LazyClientListComponent,
  LazyDiaEntregaListComponent,
  LazyRepartoListComponent,
  LazyClientesporRepartoListComponent,
  LazyConfiguracionPageComponent
} from './LazyComponents';

const MainContent = ({ activeSection }) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return (
          <Container className="py-4">
            <h2 className="mb-4">👥 Gestión de Usuarios</h2>
            <LazyUserListComponent />
          </Container>
        );
      case 'trucks':
        return (
          <Container className="py-4">
            <h2 className="mb-4">🚛 Gestión de Camiones</h2>
            <LazyTruckListComponent />
          </Container>
        );
      case 'clients':
        return (
          <Container className="py-4">
            <h2 className="mb-4">👥 Gestión de Clientes</h2>
            <LazyClientListComponent />
          </Container>
        );
      case 'diasEntrega':
        return (
          <Container className="py-4">
            <h2 className="mb-4">📅 Días de Entrega</h2>
            <LazyDiaEntregaListComponent />
          </Container>
        );
      case 'repartos':
        return (
          <Container className="py-4">
            <h2 className="mb-4">📦 Gestión de Repartos</h2>
            <LazyRepartoListComponent />
          </Container>
        );
      case 'clientesporreparto':
        return (
          <Container className="py-4">
            <h2 className="mb-4">🎯 Asignaciones Cliente-Reparto</h2>
            <LazyClientesporRepartoListComponent />
          </Container>
        );
      case 'configuracion':
        return <LazyConfiguracionPageComponent />;
          case 'showcase':
      return <div className="p-4 text-center">
        <h2>Showcase Eliminado</h2>
        <p className="text-muted">Esta sección ha sido eliminada para usar Bootstrap vanilla.</p>
      </div>;
      default:
        return <Dashboard />;
    }
  };

  return <main className="pt-4">{renderContent()}</main>;
};

export default MainContent; 
'use client';

import UserList from '../components/UserList';
import ApiStatus from '../components/ApiStatus';
import TruckList from '../components/TruckList';
import ClientList from '../components/ClientList.jsx';
import DiaEntregaList from '../components/DiaEntregaList.jsx';
import RepartoList from '../components/RepartoList.jsx';
import ClientesporRepartoList from '../components/ClientesporRepartoList.jsx';
import { useState } from 'react';

export default function Home() {
  return (
    <div className="min-vh-100 bg-light">
      <div className="container py-5">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-dark mb-3">
            🚀 Next.js Fullstack App
          </h1>
          <p className="lead text-muted">
            Aplicación fullstack con <strong>React</strong> en el frontend, <strong>Node.js API Routes</strong> en el backend
            y <strong>SQLite</strong> como base de datos. Gestiona usuarios y camiones con operaciones CRUD completas.
          </p>
        </div>

        {/* Características del proyecto */}
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div className="card h-100 text-center border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="fs-1 mb-3">⚛️</div>
                <h5 className="card-title fw-bold">Frontend React</h5>
                <p className="card-text text-muted">
                  Componentes modernos con hooks y JavaScript ES6+
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card h-100 text-center border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="fs-1 mb-3">🔧</div>
                <h5 className="card-title fw-bold">Backend Node.js</h5>
                <p className="card-text text-muted">
                  API Routes con Next.js y operaciones CRUD
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card h-100 text-center border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="fs-1 mb-3">💾</div>
                <h5 className="card-title fw-bold">Base de Datos</h5>
                <p className="card-text text-muted">
                  SQLite con fallback a Local Storage
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card h-100 text-center border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="fs-1 mb-3">🚚</div>
                <h5 className="card-title fw-bold">Gestión Fleet</h5>
                <p className="card-text text-muted">
                  Usuarios, Camiones, Clientes, Días de Entrega y Repartos con CRUD completo
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estado de la API */}
        <ApiStatus />

        {/* Pestañas para cambiar entre usuarios y camiones */}
        <TabsComponent />
      </div>
    </div>
  );
}

// Componente de pestañas
function TabsComponent() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white border-bottom">
        <ul className="nav nav-tabs card-header-tabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
              type="button"
              role="tab"
            >
              <i className="bi bi-people-fill me-2"></i>
              Usuarios
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'trucks' ? 'active' : ''}`}
              onClick={() => setActiveTab('trucks')}
              type="button"
              role="tab"
            >
              <i className="bi bi-truck me-2"></i>
              Camiones
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'clients' ? 'active' : ''}`}
              onClick={() => setActiveTab('clients')}
              type="button"
              role="tab"
            >
              <i className="bi bi-building me-2"></i>
              Clientes
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'diasEntrega' ? 'active' : ''}`}
              onClick={() => setActiveTab('diasEntrega')}
              type="button"
              role="tab"
            >
              <i className="bi bi-calendar-week me-2"></i>
              Días Entrega
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'repartos' ? 'active' : ''}`}
              onClick={() => setActiveTab('repartos')}
              type="button"
              role="tab"
            >
              <i className="bi bi-truck-flatbed me-2"></i>
              Repartos
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'clientesporreparto' ? 'active' : ''}`}
              onClick={() => setActiveTab('clientesporreparto')}
              type="button"
              role="tab"
            >
              <i className="bi bi-person-lines-fill me-2"></i>
              Clientes por Reparto
            </button>
          </li>
        </ul>
      </div>
      <div className="card-body p-0">
        <div className="tab-content">
          <div
            className={`tab-pane fade ${activeTab === 'users' ? 'show active' : ''}`}
            role="tabpanel"
          >
            {activeTab === 'users' && <UserList />}
          </div>
          <div
            className={`tab-pane fade ${activeTab === 'trucks' ? 'show active' : ''}`}
            role="tabpanel"
          >
            {activeTab === 'trucks' && <TruckList />}
          </div>
          <div
            className={`tab-pane fade ${activeTab === 'clients' ? 'show active' : ''}`}
            role="tabpanel"
          >
            {activeTab === 'clients' && <ClientList />}
          </div>
          <div
            className={`tab-pane fade ${activeTab === 'diasEntrega' ? 'show active' : ''}`}
            role="tabpanel"
          >
            {activeTab === 'diasEntrega' && <DiaEntregaList />}
          </div>
          <div
            className={`tab-pane fade ${activeTab === 'repartos' ? 'show active' : ''}`}
            role="tabpanel"
          >
            {activeTab === 'repartos' && <RepartoList />}
          </div>
          <div
            className={`tab-pane fade ${activeTab === 'clientesporreparto' ? 'show active' : ''}`}
            role="tabpanel"
          >
            {activeTab === 'clientesporreparto' && <ClientesporRepartoList />}
          </div>
        </div>
      </div>
    </div>
  );
}

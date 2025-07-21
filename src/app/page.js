'use client';

import { useState } from 'react';
import { Container, Row, Col, Card, Nav, Tab } from 'react-bootstrap';
import { 
  UserList, 
  TruckList, 
  ClientList, 
  DiaEntregaList, 
  RepartoList, 
  ClientesporRepartoList,
  ApiStatus 
} from '../components';

export default function Home() {
  return (
    <div className="min-vh-100 bg-light">
      <Container className="py-5">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-dark mb-3">
            � MapaClientes
          </h1>
          <p className="lead text-muted">
            Sistema integral de gestión logística con <strong>React Bootstrap</strong> en el frontend, <strong>Node.js API Routes</strong> en el backend
            y <strong>SQLite</strong> como base de datos. Administra clientes, camiones, repartos y entregas con operaciones CRUD completas.
          </p>
        </div>

        {/* Características del proyecto */}
        <Row className="g-4 mb-5">
          <Col md={3}>
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="fs-1 mb-3">⚛️</div>
                <Card.Title className="fw-bold">Frontend React</Card.Title>
                <Card.Text className="text-muted">
                  Componentes modernos con hooks y JavaScript ES6+
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="fs-1 mb-3">🔧</div>
                <Card.Title className="fw-bold">Backend Node.js</Card.Title>
                <Card.Text className="text-muted">
                  API Routes con Next.js y operaciones CRUD
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="fs-1 mb-3">💾</div>
                <Card.Title className="fw-bold">Base de Datos</Card.Title>
                <Card.Text className="text-muted">
                  SQLite con fallback a Local Storage
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="fs-1 mb-3">🚚</div>
                <Card.Title className="fw-bold">Gestión Fleet</Card.Title>
                <Card.Text className="text-muted">
                  Usuarios, Camiones, Clientes, Días de Entrega y Repartos con CRUD completo
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Estado de la API */}
        <ApiStatus />

        {/* Pestañas para cambiar entre usuarios y camiones */}
        <TabsComponent />
      </Container>
    </div>
  );
}

// Componente de pestañas
function TabsComponent() {
  return (
    <Card className="border-0 shadow-sm">
      <Tab.Container defaultActiveKey="users">
        <Card.Header className="bg-white border-bottom">
          <Nav variant="tabs" className="card-header-tabs">
            <Nav.Item>
              <Nav.Link eventKey="users">
                <i className="bi bi-people-fill me-2"></i>
                Usuarios
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="trucks">
                <i className="bi bi-truck me-2"></i>
                Camiones
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="clients">
                <i className="bi bi-building me-2"></i>
                Clientes
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="diasEntrega">
                <i className="bi bi-calendar-week me-2"></i>
                Días Entrega
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="repartos">
                <i className="bi bi-truck-flatbed me-2"></i>
                Repartos
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="clientesporreparto">
                <i className="bi bi-person-lines-fill me-2"></i>
                Clientes por Reparto
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <Card.Body className="p-0">
          <Tab.Content>
            <Tab.Pane eventKey="users">
              <UserList />
            </Tab.Pane>
            <Tab.Pane eventKey="trucks">
              <TruckList />
            </Tab.Pane>
            <Tab.Pane eventKey="clients">
              <ClientList />
            </Tab.Pane>
            <Tab.Pane eventKey="diasEntrega">
              <DiaEntregaList />
            </Tab.Pane>
            <Tab.Pane eventKey="repartos">
              <RepartoList />
            </Tab.Pane>
            <Tab.Pane eventKey="clientesporreparto">
              <ClientesporRepartoList />
            </Tab.Pane>
          </Tab.Content>
        </Card.Body>
      </Tab.Container>
    </Card>
  );
}

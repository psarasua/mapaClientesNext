'use client';

import { useState } from 'react';
import { Container, Row, Col, Card, Alert, Button, ButtonGroup } from 'react-bootstrap';
import { FaTruck, FaUsers, FaMapMarkedAlt, FaBoxes, FaChartLine } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatsCard from './StatsCard';
import { useDashboardStats, useDashboardPolling } from '../../hooks/useDashboard';
import { useClients } from '../../hooks/useClients';
import { useTrucks } from '../../hooks/useTrucks';
import MapComponent from './MapComponent';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Dashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Usar el hook del dashboard
  const {
    stats,
    chartData,
    pieData,
    recentActivity,
    isLoading,
    refetch
  } = useDashboardStats();

  // Importar hooks adicionales para obtener datos completos para el mapa
  const { data: clients = [] } = useClients();
  const { data: trucks = [] } = useTrucks();

  // Polling automático (solo si está activado)
  useDashboardPolling(autoRefresh ? 30000 : 0);

  const handleManualRefresh = () => {
    refetch();
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  if (isLoading) {
    return (
      <Container fluid className="py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Cargando...</span>
            </div>
            <h5 className="text-muted">Cargando dashboard...</h5>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header con controles */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0">
                <FaChartLine className="me-2 text-primary" />
                Dashboard
              </h2>
              <p className="text-muted mb-0">Vista general del sistema</p>
            </div>
            <ButtonGroup>
              <Button
                variant={autoRefresh ? 'success' : 'outline-secondary'}
                onClick={toggleAutoRefresh}
                size="sm"
              >
                <i className={`bi ${autoRefresh ? 'bi-play-fill' : 'bi-pause-fill'} me-1`}></i>
                {autoRefresh ? 'Auto-actualización' : 'Manual'}
              </Button>
              <Button
                variant="outline-primary"
                onClick={handleManualRefresh}
                size="sm"
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Actualizar
              </Button>
            </ButtonGroup>
          </div>
        </Col>
      </Row>

      {/* Tarjetas de estadísticas */}
      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-3">
          <StatsCard
            title="Usuarios"
            value={stats.totalUsers}
            icon={<FaUsers />}
            color="primary"
            trend="+5.2%"
          />
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <StatsCard
            title="Camiones"
            value={stats.totalTrucks}
            icon={<FaTruck />}
            color="success"
            trend="+2.1%"
          />
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <StatsCard
            title="Clientes"
            value={stats.totalClients}
            icon={<FaMapMarkedAlt />}
            color="warning"
            trend="+8.3%"
          />
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <StatsCard
            title="Repartos"
            value={stats.totalRepartos}
            icon={<FaBoxes />}
            color="info"
            trend="+1.7%"
          />
        </Col>
      </Row>

      <Row>
        {/* Gráfico de barras */}
        <Col lg={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <Card.Title className="mb-0">
                <FaChartLine className="me-2 text-primary" />
                Distribución por Categoría
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Gráfico circular */}
        <Col lg={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <Card.Title className="mb-0">
                <FaChartLine className="me-2 text-success" />
                Distribución Porcentual
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Mapa */}
        <Col lg={8} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <Card.Title className="mb-0">
                <FaMapMarkedAlt className="me-2 text-info" />
                Mapa de Ubicaciones
              </Card.Title>
            </Card.Header>
            <Card.Body className="p-0" style={{ borderRadius: '0.375rem', overflow: 'hidden' }}>
              <MapComponent clients={clients} trucks={trucks} />
            </Card.Body>
          </Card>
        </Col>

        {/* Actividad reciente */}
        <Col lg={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <Card.Title className="mb-0">
                <i className="bi bi-clock-history me-2 text-warning"></i>
                Actividad Reciente
              </Card.Title>
            </Card.Header>
            <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {recentActivity.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-inbox display-6 mb-2"></i>
                  <p className="mb-0">No hay actividad reciente</p>
                </div>
              ) : (
                <div className="activity-feed">
                  {recentActivity.map((activity, index) => (
                    <div key={activity.id} className={`activity-item ${index !== recentActivity.length - 1 ? 'border-bottom' : ''} pb-3 mb-3`}>
                      <div className="d-flex">
                        <div className="flex-shrink-0">
                          <span className={`badge bg-${activity.type === 'success' ? 'success' : activity.type === 'danger' ? 'danger' : activity.type === 'primary' ? 'primary' : 'info'} rounded-pill`}>
                            {activity.icon}
                          </span>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h6 className="mb-1">{activity.title}</h6>
                          <p className="mb-1 small text-muted">{activity.description}</p>
                          <small className="text-muted">{activity.time}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Estado de actualización automática */}
      {autoRefresh && (
        <Row>
          <Col>
            <Alert variant="info" className="d-flex align-items-center">
              <i className="bi bi-info-circle me-2"></i>
              <span>Actualización automática activada - Los datos se actualizan cada 30 segundos</span>
            </Alert>
          </Col>
        </Row>
      )}
    </Container>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { FaTruck, FaUsers, FaMapMarkedAlt, FaBoxes, FaChartLine } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import MapComponent from './MapComponent';
import StatsCard from './StatsCard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTrucks: 0,
    totalClients: 0,
    totalRepartos: 0,
    totalClientesporReparto: 0
  });
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Obtener datos de todas las APIs
      const [usersRes, trucksRes, clientsRes, repartosRes, clientesRepartoRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/trucks'),
        fetch('/api/clients'),
        fetch('/api/repartos'),
        fetch('/api/clientesporreparto')
      ]);

      const usersData = await usersRes.json();
      const trucksData = await trucksRes.json();
      const clientsData = await clientsRes.json();
      const repartosData = await repartosRes.json();
      const clientesRepartoData = await clientesRepartoRes.json();

      // Extraer los arrays de datos de las respuestas
      const users = usersData.users || [];
      const trucks = trucksData.trucks || [];
      const clients = clientsData.clients || [];
      const repartos = repartosData.repartos || [];
      const clientesReparto = clientesRepartoData.clientesporreparto || [];

      // Actualizar estadísticas
      setStats({
        totalUsers: users.length,
        totalTrucks: trucks.length,
        totalClients: clients.length,
        totalRepartos: repartos.length,
        totalClientesporReparto: clientesReparto.length
      });

      // Datos para gráfico de barras - Repartos por camión
      const repartosPorCamion = {};
      repartos.forEach(reparto => {
        const truck = trucks.find(t => t.id === reparto.truckId);
        const truckName = truck ? truck.name : 'Sin asignar';
        repartosPorCamion[truckName] = (repartosPorCamion[truckName] || 0) + 1;
      });

      const barData = Object.entries(repartosPorCamion).map(([name, value]) => ({
        name,
        repartos: value
      }));
      setChartData(barData);

      // Datos para gráfico circular - Estados de camiones
      const estadosCamiones = {};
      trucks.forEach(truck => {
        const estado = truck.status || 'Disponible';
        estadosCamiones[estado] = (estadosCamiones[estado] || 0) + 1;
      });

      const pieChartData = Object.entries(estadosCamiones).map(([name, value]) => ({
        name,
        value
      }));
      setPieData(pieChartData);

    } catch (err) {
      setError('Error al cargar los datos del dashboard');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando dashboard...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header del Dashboard */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className="h3 mb-0">📊 Dashboard MapaClientes</h1>
              <p className="text-muted mb-0">Resumen general del sistema logístico</p>
            </div>
            <div className="text-end">
              <small className="text-muted">
                Última actualización: {new Date().toLocaleString('es-ES')}
              </small>
            </div>
          </div>
        </Col>
      </Row>

      {/* Tarjetas de Estadísticas */}
      <Row className="mb-4">
        <Col lg={2} md={4} sm={6} className="mb-3">
          <StatsCard
            icon={<FaUsers />}
            title="Usuarios"
            value={stats.totalUsers}
            color="primary"
            subtitle="Total registrados"
          />
        </Col>
        <Col lg={2} md={4} sm={6} className="mb-3">
          <StatsCard
            icon={<FaTruck />}
            title="Camiones"
            value={stats.totalTrucks}
            color="success"
            subtitle="Flota disponible"
          />
        </Col>
        <Col lg={2} md={4} sm={6} className="mb-3">
          <StatsCard
            icon={<FaUsers />}
            title="Clientes"
            value={stats.totalClients}
            color="info"
            subtitle="Base de clientes"
          />
        </Col>
        <Col lg={2} md={4} sm={6} className="mb-3">
          <StatsCard
            icon={<FaMapMarkedAlt />}
            title="Repartos"
            value={stats.totalRepartos}
            color="warning"
            subtitle="Rutas programadas"
          />
        </Col>
        <Col lg={2} md={4} sm={6} className="mb-3">
          <StatsCard
            icon={<FaBoxes />}
            title="Asignaciones"
            value={stats.totalClientesporReparto}
            color="danger"
            subtitle="Clientes asignados"
          />
        </Col>
        <Col lg={2} md={4} sm={6} className="mb-3">
          <StatsCard
            icon={<FaChartLine />}
            title="Eficiencia"
            value="95%"
            color="secondary"
            subtitle="Entregas exitosas"
          />
        </Col>
      </Row>

      {/* Gráficos y Mapa */}
      <Row>
        {/* Gráfico de Barras */}
        <Col lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">📈 Repartos por Camión</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="repartos" fill="#0d6efd" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Gráfico Circular */}
        <Col lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">🚛 Estados de Camiones</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={250}>
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
            </Card.Body>
          </Card>
        </Col>

        {/* Mapa */}
        <Col lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">🗺️ Mapa de Rutas</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <MapComponent />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Actividad Reciente */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">📋 Actividad Reciente</h5>
            </Card.Header>
            <Card.Body>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-marker bg-success"></div>
                  <div className="timeline-content">
                    <h6 className="timeline-title">Nuevo reparto asignado</h6>
                    <p className="timeline-description">Camión "Volvo FH" asignado a ruta Centro - Norte</p>
                    <small className="text-muted">Hace 2 horas</small>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-marker bg-info"></div>
                  <div className="timeline-content">
                    <h6 className="timeline-title">Cliente agregado</h6>
                    <p className="timeline-description">Nuevo cliente "Distribuidora Los Andes" registrado</p>
                    <small className="text-muted">Hace 4 horas</small>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-marker bg-warning"></div>
                  <div className="timeline-content">
                    <h6 className="timeline-title">Mantenimiento programado</h6>
                    <p className="timeline-description">Camión "Mercedes Actros" en mantenimiento preventivo</p>
                    <small className="text-muted">Hace 6 horas</small>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

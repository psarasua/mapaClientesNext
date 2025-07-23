'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const lastDataSnapshot = useRef(null);
  const lastDataHash = useRef(null);

  // Función para crear un hash simple de los datos
  const createDataHash = (data) => {
    const str = JSON.stringify({
      users: data.users?.map(u => ({ id: u.id, usuario: u.usuario, updated_at: u.updated_at })) || [],
      trucks: data.trucks?.map(t => ({ id: t.id, status: t.status, updated_at: t.updated_at })) || [],
      clients: data.clients?.map(c => ({ id: c.id, name: c.name, updated_at: c.updated_at })) || [],
      repartos: data.repartos?.map(r => ({ id: r.id, name: r.name, updated_at: r.updated_at })) || [],
      clientesReparto: data.clientesReparto?.map(cr => ({ client_id: cr.client_id, reparto_id: cr.reparto_id })) || []
    });
    
    // Hash simple usando la longitud y algunos caracteres clave
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32bit integer
    }
    return hash.toString();
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Actualizar cada 15 segundos para balance entre tiempo real y rendimiento
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const detectChanges = (currentData, previousData) => {
    const activities = [];
    const now = new Date();

    if (!previousData) return activities;

    // Función helper para comparar arrays y detectar cambios
    const compareArrays = (current, previous, idField = 'id') => {
      const added = current.filter(item => 
        !previous.find(prev => prev[idField] === item[idField])
      );
      const removed = previous.filter(prev => 
        !current.find(item => item[idField] === prev[idField])
      );
      const modified = current.filter(item => {
        const prevItem = previous.find(prev => prev[idField] === item[idField]);
        return prevItem && JSON.stringify(item) !== JSON.stringify(prevItem);
      });
      
      return { added, removed, modified };
    };

    // Detectar cambios en usuarios
    if (currentData.users && previousData.users) {
      const userChanges = compareArrays(currentData.users, previousData.users);
      
      // Usuarios nuevos
      userChanges.added.forEach(user => {
        const minutesAgo = user.created_at ? 
          Math.max(1, Math.floor((now - new Date(user.created_at)) / (1000 * 60))) : 1;
        activities.push({
          id: `user-new-${user.id}-${Date.now()}`,
          title: '👤 Usuario creado',
          description: `Nuevo usuario "${user.usuario}" registrado en el sistema`,
          time: `Hace ${minutesAgo} minuto${minutesAgo > 1 ? 's' : ''}`,
          type: 'success',
          icon: '➕',
          timestamp: user.created_at ? new Date(user.created_at) : now
        });
      });

      // Usuarios eliminados
      userChanges.removed.forEach(user => {
        activities.push({
          id: `user-deleted-${user.id}-${Date.now()}`,
          title: '👤 Usuario eliminado',
          description: `Usuario "${user.usuario}" fue removido del sistema`,
          time: 'Ahora mismo',
          type: 'danger',
          icon: '🗑️',
          timestamp: now
        });
      });

      // Usuarios modificados
      userChanges.modified.forEach(user => {
        activities.push({
          id: `user-updated-${user.id}-${Date.now()}`,
          title: '👤 Usuario actualizado',
          description: `Usuario "${user.usuario}" fue modificado`,
          time: 'Ahora mismo',
          type: 'info',
          icon: '✏️',
          timestamp: now
        });
      });
    }

    // Detectar cambios en camiones
    if (currentData.trucks && previousData.trucks) {
      // Camiones nuevos
      const newTrucks = currentData.trucks.filter(truck => 
        !previousData.trucks.find(prev => prev.id === truck.id)
      );
      newTrucks.forEach(truck => {
        const minutesAgo = truck.created_at ? 
          Math.max(1, Math.floor((now - new Date(truck.created_at)) / (1000 * 60))) : 1;
        activities.push({
          id: `truck-new-${truck.id}-${Date.now()}`,
          title: '🚛 Camión agregado',
          description: `Nuevo camión "${truck.description || truck.name || 'Sin descripción'}" añadido a la flota`,
          time: `Hace ${minutesAgo} minuto${minutesAgo > 1 ? 's' : ''}`,
          type: 'primary',
          icon: '➕',
          timestamp: truck.created_at ? new Date(truck.created_at) : now
        });
      });

      // Camiones eliminados
      const deletedTrucks = previousData.trucks.filter(prev => 
        !currentData.trucks.find(truck => truck.id === prev.id)
      );
      deletedTrucks.forEach(truck => {
        activities.push({
          id: `truck-deleted-${truck.id}-${Date.now()}`,
          title: '🚛 Camión eliminado',
          description: `Camión "${truck.description || truck.name || 'Sin descripción'}" fue removido de la flota`,
          time: 'Ahora mismo',
          type: 'danger',
          icon: '🗑️',
          timestamp: now
        });
      });

      // Cambios de estado de camiones
      currentData.trucks.forEach(truck => {
        const prevTruck = previousData.trucks.find(prev => prev.id === truck.id);
        if (prevTruck && prevTruck.status !== truck.status) {
          const statusIcons = {
            'Disponible': '✅',
            'En Ruta': '🚚', 
            'Mantenimiento': '🔧'
          };
          activities.push({
            id: `truck-status-${truck.id}-${Date.now()}`,
            title: '🚛 Estado de camión',
            description: `Camión "${truck.description || truck.name || 'Sin descripción'}" cambió a: ${truck.status}`,
            time: 'Ahora mismo',
            type: truck.status === 'Disponible' ? 'success' : 
                  truck.status === 'En Ruta' ? 'warning' : 'danger',
            icon: statusIcons[truck.status] || '🔄',
            timestamp: now
          });
        }
      });
    }

    // Detectar cambios en clientes
    if (currentData.clients && previousData.clients) {
      // Clientes nuevos
      const newClients = currentData.clients.filter(client => 
        !previousData.clients.find(prev => prev.id === client.id)
      );
      newClients.forEach(client => {
        const minutesAgo = client.created_at ? 
          Math.max(1, Math.floor((now - new Date(client.created_at)) / (1000 * 60))) : 1;
        activities.push({
          id: `client-new-${client.id}-${Date.now()}`,
          title: '🏢 Cliente agregado',
          description: `Nuevo cliente "${client.name}" registrado`,
          time: `Hace ${minutesAgo} minuto${minutesAgo > 1 ? 's' : ''}`,
          type: 'info',
          icon: '➕',
          timestamp: client.created_at ? new Date(client.created_at) : now
        });
      });

      // Clientes eliminados
      const deletedClients = previousData.clients.filter(prev => 
        !currentData.clients.find(client => client.id === prev.id)
      );
      deletedClients.forEach(client => {
        activities.push({
          id: `client-deleted-${client.id}-${Date.now()}`,
          title: '🏢 Cliente eliminado',
          description: `Cliente "${client.name}" fue removido`,
          time: 'Ahora mismo',
          type: 'danger',
          icon: '🗑️',
          timestamp: now
        });
      });

      // Clientes modificados
      currentData.clients.forEach(client => {
        const prevClient = previousData.clients.find(prev => prev.id === client.id);
        if (prevClient && (
          prevClient.name !== client.name || 
          prevClient.email !== client.email ||
          prevClient.address !== client.address ||
          prevClient.updated_at !== client.updated_at
        )) {
          activities.push({
            id: `client-updated-${client.id}-${Date.now()}`,
            title: '🏢 Cliente actualizado',
            description: `Cliente "${client.name}" fue modificado`,
            time: 'Ahora mismo',
            type: 'info',
            icon: '✏️',
            timestamp: now
          });
        }
      });
    }

    // Detectar cambios en repartos
    if (currentData.repartos && previousData.repartos) {
      // Repartos nuevos
      const newRepartos = currentData.repartos.filter(reparto => 
        !previousData.repartos.find(prev => prev.id === reparto.id)
      );
      newRepartos.forEach(reparto => {
        activities.push({
          id: `reparto-new-${reparto.id}-${Date.now()}`,
          title: '📦 Reparto creado',
          description: `Nuevo reparto "${reparto.name}" programado`,
          time: 'Ahora mismo',
          type: 'warning',
          icon: '➕',
          timestamp: now
        });
      });

      // Repartos eliminados
      const deletedRepartos = previousData.repartos.filter(prev => 
        !currentData.repartos.find(reparto => reparto.id === prev.id)
      );
      deletedRepartos.forEach(reparto => {
        activities.push({
          id: `reparto-deleted-${reparto.id}-${Date.now()}`,
          title: '📦 Reparto eliminado',
          description: `Reparto "${reparto.name}" fue cancelado`,
          time: 'Ahora mismo',
          type: 'danger',
          icon: '🗑️',
          timestamp: now
        });
      });
    }

    // Detectar cambios en asignaciones cliente-reparto
    if (currentData.clientesReparto && previousData.clientesReparto) {
      // Nuevas asignaciones
      const newAssignments = currentData.clientesReparto.filter(assignment => 
        !previousData.clientesReparto.find(prev => 
          prev.client_id === assignment.client_id && prev.reparto_id === assignment.reparto_id
        )
      );
      newAssignments.forEach(assignment => {
        const client = currentData.clients?.find(c => c.id === assignment.client_id);
        const reparto = currentData.repartos?.find(r => r.id === assignment.reparto_id);
        activities.push({
          id: `assignment-new-${assignment.client_id}-${assignment.reparto_id}-${Date.now()}`,
          title: '🔗 Asignación creada',
          description: `Cliente "${client?.name || 'ID:' + assignment.client_id}" asignado a reparto "${reparto?.name || 'ID:' + assignment.reparto_id}"`,
          time: 'Ahora mismo',
          type: 'success',
          icon: '🔗',
          timestamp: now
        });
      });

      // Asignaciones eliminadas
      const deletedAssignments = previousData.clientesReparto.filter(prev => 
        !currentData.clientesReparto.find(assignment => 
          assignment.client_id === prev.client_id && assignment.reparto_id === prev.reparto_id
        )
      );
      deletedAssignments.forEach(assignment => {
        const client = previousData.clients?.find(c => c.id === assignment.client_id);
        const reparto = previousData.repartos?.find(r => r.id === assignment.reparto_id);
        activities.push({
          id: `assignment-deleted-${assignment.client_id}-${assignment.reparto_id}-${Date.now()}`,
          title: '🔗 Asignación eliminada',
          description: `Cliente "${client?.name || 'ID:' + assignment.client_id}" desasignado de reparto "${reparto?.name || 'ID:' + assignment.reparto_id}"`,
          time: 'Ahora mismo',
          type: 'warning',
          icon: '🔓',
          timestamp: now
        });
      });
    }

    // Ordenar por timestamp (más reciente primero) y limitar a 8 actividades
    return activities
      .sort((a, b) => (b.timestamp || new Date()) - (a.timestamp || new Date()))
      .slice(0, 8);
  };

  const generateRecentActivity = (users, trucks, clients, repartos, clientesReparto) => {
    // Crear objeto con todos los datos actuales
    const currentData = {
      users,
      trucks,
      clients,
      repartos,
      clientesReparto
    };

    // Detectar cambios comparando con el snapshot anterior
    const activities = detectChanges(currentData, lastDataSnapshot.current);
    
    // Si hay cambios detectados, los devolvemos
    if (activities.length > 0) {
      console.log('🔄 Cambios detectados:', activities.length, 'actividades nuevas');
      return activities;
    }

    // Si no hay cambios y ya tenemos actividades, mantener las existentes
    if (lastDataSnapshot.current) {
      console.log('📋 Sin cambios - manteniendo actividades existentes');
      return recentActivity; // Mantener las actividades actuales
    }

    // Solo generar actividades de fallback en la primera carga
    console.log('🚀 Primera carga - generando actividades iniciales');
    const fallbackActivities = [];
    const now = new Date();
    const allData = [
      ...(users?.map(u => ({ ...u, type: 'user', table: 'usuarios' })) || []),
      ...(trucks?.map(t => ({ ...t, type: 'truck', table: 'camiones' })) || []),
      ...(clients?.map(c => ({ ...c, type: 'client', table: 'clientes' })) || []),
      ...(repartos?.map(r => ({ ...r, type: 'reparto', table: 'repartos' })) || [])
    ];

    // Ordenar por fecha de creación más reciente
    const recentItems = allData
      .filter(item => item.created_at || item.date_created)
      .sort((a, b) => {
        const dateA = new Date(a.created_at || a.date_created);
        const dateB = new Date(b.created_at || b.date_created);
        return dateB - dateA;
      })
      .slice(0, 5);

    recentItems.forEach(item => {
      const itemDate = new Date(item.created_at || item.date_created);
      const hoursAgo = Math.floor((now - itemDate) / (1000 * 60 * 60));
      const minutesAgo = Math.floor((now - itemDate) / (1000 * 60));
      
      let timeText;
      if (hoursAgo > 24) {
        const daysAgo = Math.floor(hoursAgo / 24);
        timeText = `Hace ${daysAgo} día${daysAgo > 1 ? 's' : ''}`;
      } else if (hoursAgo > 0) {
        timeText = `Hace ${hoursAgo} hora${hoursAgo > 1 ? 's' : ''}`;
      } else if (minutesAgo > 0) {
        timeText = `Hace ${minutesAgo} minuto${minutesAgo > 1 ? 's' : ''}`;
      } else {
        timeText = 'Ahora mismo';
      }

      const icons = {
        user: '👤',
        truck: '🚛', 
        client: '🏢',
        reparto: '📦'
      };

      const typeTexts = {
        user: 'Usuario registrado',
        truck: 'Camión agregado',
        client: 'Cliente registrado', 
        reparto: 'Reparto creado'
      };

      const getName = (item) => {
        if (item.type === 'user') return item.usuario;
        if (item.type === 'truck') return item.description || item.name || 'Sin descripción';
        if (item.type === 'client') return item.name;
        if (item.type === 'reparto') return item.name;
        return 'Elemento';
      };

      fallbackActivities.push({
        id: `${item.type}-${item.id}-${itemDate.getTime()}`,
        title: `${icons[item.type]} ${typeTexts[item.type]}`,
        description: `${getName(item)} fue añadido al sistema`,
        time: timeText,
        type: 'info',
        icon: '➕',
        timestamp: itemDate
      });
    });

    return fallbackActivities;
  };

  const fetchDashboardData = async () => {
    try {
      // Solo mostrar loading en la primera carga
      if (lastDataHash.current === null) {
        setLoading(true);
      } else {
        setIsUpdating(true);
      }
      
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

      // Generar actividad reciente basada en datos reales
      const currentData = { users, trucks, clients, repartos, clientesReparto };
      
      // Crear hash de los datos actuales para detectar cambios
      const currentHash = createDataHash(currentData);
      
      // Solo actualizar si hay cambios reales o es la primera carga
      if (lastDataHash.current === null || lastDataHash.current !== currentHash) {
        const activity = generateRecentActivity(users, trucks, clients, repartos, clientesReparto);
        setRecentActivity(activity);
        
        // Guardar snapshot y hash actuales para la próxima comparación
        lastDataSnapshot.current = JSON.parse(JSON.stringify(currentData));
        lastDataHash.current = currentHash;
        
        console.log('📊 Dashboard actualizado - se detectaron cambios');
      } else {
        console.log('⏭️ Sin cambios detectados - manteniendo estado actual');
      }

    } catch (err) {
      setError('Error al cargar los datos del dashboard');
      console.error('Error:', err);
    } finally {
      setLoading(false);
      setIsUpdating(false);
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
              <div className="d-flex align-items-center">
                {isUpdating && (
                  <div className="me-2">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Actualizando...</span>
                    </div>
                    <small className="text-primary ms-1">Actualizando...</small>
                  </div>
                )}
                <small className="text-muted">
                  Última actualización: {new Date().toLocaleString('es-ES')}
                  <br />
                  <span className="badge bg-success">🔄 Actualización cada 15s</span>
                </small>
              </div>
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
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📋 Actividad Reciente</h5>
              <small className="text-muted">
                🔄 Actualización automática cada 15s
              </small>
            </Card.Header>
            <Card.Body>
              {recentActivity.length > 0 ? (
                <div className="timeline">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="timeline-item">
                      <div className={`timeline-marker bg-${activity.type === 'primary' ? 'primary' : 
                                     activity.type === 'success' ? 'success' : 
                                     activity.type === 'info' ? 'info' : 
                                     activity.type === 'warning' ? 'warning' : 'danger'}`}></div>
                      <div className="timeline-content">
                        <h6 className="timeline-title">
                          <span className="me-2">{activity.icon}</span>
                          {activity.title}
                        </h6>
                        <p className="timeline-description">{activity.description}</p>
                        <small className="text-muted">{activity.time}</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-muted">
                    <span style={{ fontSize: '2rem' }}>📭</span>
                    <p className="mt-2">No hay actividad reciente para mostrar</p>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Alert, Spinner } from 'react-bootstrap';
import { FaDatabase, FaServer, FaTable, FaPlay, FaTrash, FaCheck, FaTimes, FaSync, FaFileExcel, FaUpload } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function ConfiguracionPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  // Redirigir si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const [status, setStatus] = useState({
    server: null,
    database: null,
    tables: null
  });
  const [loading, setLoading] = useState({
    server: false,
    database: false,
    tables: false,
    seed: false,
    clear: false,
    users: false,
    clients: false,
    trucks: false,
    repartos: false,
    diasEntrega: false,
    clientesporReparto: false
  });
  const [data, setData] = useState({
    users: [],
    clients: [],
    trucks: [],
    repartos: [],
    diasEntrega: [],
    clientesporReparto: []
  });
  const [showData, setShowData] = useState(false);

  // Probar conexión al servidor
  const testServer = async () => {
    setLoading(prev => ({ ...prev, server: true }));
    try {
      const response = await fetch('/api/health');
      const result = await response.json();
      setStatus(prev => ({ 
        ...prev, 
        server: { 
          success: response.ok, 
          message: result.message || 'Servidor funcionando',
          details: result 
        } 
      }));
    } catch (error) {
      setStatus(prev => ({ 
        ...prev, 
        server: { 
          success: false, 
          message: 'Error de conexión al servidor',
          details: error.message 
        } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, server: false }));
    }
  };

  // Probar conexión a la base de datos
  const testDatabase = async () => {
    setLoading(prev => ({ ...prev, database: true }));
    try {
      const response = await fetch('/api/health');
      const result = await response.json();
      setStatus(prev => ({ 
        ...prev, 
        database: { 
          success: result.database?.status === 'ok', 
          message: result.database?.message || 'Base de datos conectada',
          details: result.database 
        } 
      }));
    } catch (error) {
      setStatus(prev => ({ 
        ...prev, 
        database: { 
          success: false, 
          message: 'Error de conexión a la base de datos',
          details: error.message 
        } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, database: false }));
    }
  };

  // Verificar tablas de la base de datos
  const testTables = async () => {
    setLoading(prev => ({ ...prev, tables: true }));
    const tables = ['users', 'clients', 'trucks', 'repartos', 'diasEntrega', 'clientesporReparto'];
    const results = {};

    for (const table of tables) {
      try {
        let endpoint;
        switch (table) {
          case 'users':
            endpoint = '/api/users';
            break;
          case 'clients':
            endpoint = '/api/clients';
            break;
          case 'trucks':
            endpoint = '/api/trucks';
            break;
          case 'repartos':
            endpoint = '/api/repartos';
            break;
          case 'diasEntrega':
            endpoint = '/api/diasEntrega';
            break;
          case 'clientesporReparto':
            endpoint = '/api/clientesporreparto';
            break;
          default:
            continue;
        }

        const response = await fetch(endpoint);
        const result = await response.json();
        
        results[table] = {
          success: response.ok,
          count: Array.isArray(result[table]) ? result[table].length : 
                 Array.isArray(result.data) ? result.data.length : 0,
          message: response.ok ? `Tabla ${table} accesible` : `Error en tabla ${table}`
        };
      } catch (error) {
        results[table] = {
          success: false,
          count: 0,
          message: `Error: ${error.message}`
        };
      }
    }

    setStatus(prev => ({ ...prev, tables: results }));
    setLoading(prev => ({ ...prev, tables: false }));
  };

  // Cargar datos de todas las tablas
  const loadData = async () => {
    const endpoints = {
      users: '/api/users',
      clients: '/api/clients',
      trucks: '/api/trucks',
      repartos: '/api/repartos',
      diasEntrega: '/api/diasEntrega',
      clientesporReparto: '/api/clientesporreparto'
    };

    const newData = {};

    for (const [key, endpoint] of Object.entries(endpoints)) {
      try {
        const response = await fetch(endpoint);
        const result = await response.json();
        newData[key] = result[key] || result.data || [];
      } catch (error) {
        console.error(`Error cargando ${key}:`, error);
        newData[key] = [];
      }
    }

    setData(newData);
    setShowData(true);
  };

  // Ejecutar seeders
  const runSeeders = async () => {
    setLoading(prev => ({ ...prev, seed: true }));
    try {
      // Ejecutar seeders para cada tabla
      const seedPromises = [
        fetch('/api/trucks', { method: 'GET' }), // Esto creará camiones si no existen
        fetch('/api/clients', { method: 'GET' }), // Esto creará clientes si no existen
        fetch('/api/auth/seed', { // Crear usuarios iniciales
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'seed-users' })
        }),
      ];

      const results = await Promise.all(seedPromises);
      const seedResult = await results[2].json(); // Resultado del seeder de usuarios
      
      // Refrescar estado de tablas
      await testTables();
      
      if (seedResult.success) {
        alert(`Seeders ejecutados exitosamente. ${seedResult.message}`);
      } else {
        alert('Seeders ejecutados (algunos con advertencias): ' + seedResult.message);
      }
    } catch (error) {
      console.error('Error ejecutando seeders:', error);
      alert('Error ejecutando seeders: ' + error.message);
    } finally {
      setLoading(prev => ({ ...prev, seed: false }));
    }
  };

  // Limpiar datos de una tabla específica
  const clearSpecificTable = async (tableName, displayName) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar TODOS los ${displayName}? Esta acción no se puede deshacer.`)) {
      return;
    }

    setLoading(prev => ({ ...prev, [tableName]: true }));
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'clear',
          tables: [tableName]
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const tableResult = result.results?.[tableName];
        if (tableResult) {
          alert(`${displayName} eliminados exitosamente (${tableResult.deletedCount || 0} registros)`);
        } else {
          alert(`${displayName} eliminados exitosamente`);
        }
        // Refrescar estado de tablas
        await testTables();
      } else {
        const errorMessage = result.error || result.message || result.details || 'Error desconocido';
        const tableResult = result.results?.[tableName];
        const specificError = tableResult?.message || errorMessage;
        
        alert(`Error eliminando ${displayName}: ${specificError}`);
      }
    } catch (error) {
      alert(`Error eliminando ${displayName}: ` + (error.message || 'Error desconocido'));
    } finally {
      setLoading(prev => ({ ...prev, [tableName]: false }));
    }
  };

  // Limpiar datos - Función general (mantener para compatibilidad)
  const clearData = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar TODOS los datos? Esta acción no se puede deshacer.')) {
      return;
    }

    setLoading(prev => ({ ...prev, clear: true }));
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'clear',
          tables: ['users', 'clients', 'trucks', 'repartos', 'diasEntrega', 'clientesporReparto']
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Datos eliminados exitosamente: ${result.message}`);
        // Refrescar estado de tablas
        await testTables();
      } else {
        alert('Error limpiando datos: ' + result.error);
      }
    } catch (error) {
      console.error('Error limpiando datos:', error);
      alert('Error limpiando datos: ' + error.message);
    } finally {
      setLoading(prev => ({ ...prev, clear: false }));
    }
  };

  // Función para mostrar el estado con colores
  const StatusIndicator = ({ status }) => {
    if (!status) return (
      <Alert variant="secondary" className="d-flex align-items-center mb-0 py-2">
        <div className="rounded-circle bg-secondary me-2" style={{width: '12px', height: '12px'}}></div>
        <small>Sin probar</small>
      </Alert>
    );
    
    return (
      <Alert variant={status.success ? 'success' : 'danger'} className="d-flex align-items-center mb-0 py-2">
        {status.success ? (
          <FaCheck className="me-2 text-success" />
        ) : (
          <FaTimes className="me-2 text-danger" />
        )}
        <small><strong>{status.message}</strong></small>
      </Alert>
    );
  };

  // Mostrar spinner mientras se verifica la autenticación
  if (authLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Verificando autenticación...</p>
        </div>
      </Container>
    );
  }

  // Si no está autenticado, no mostrar nada (se redirige en useEffect)
  if (!user) {
    return null;
  }

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <div className="mb-4">
            <h1 className="display-5 fw-bold text-dark mb-2">⚙️ Configuración del Sistema</h1>
            <p className="text-muted fs-5">Monitoreo y gestión de la base de datos y servidor</p>
          </div>

          {/* Panel de Tests de Conexión */}
          <Row className="mb-4">
            {/* Test Servidor */}
            <Col md={4} className="mb-3">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center">
                      <FaServer className="text-primary fs-4 me-2" />
                      <h5 className="mb-0 fw-semibold">Servidor</h5>
                    </div>
                    <Button
                      variant="primary"
                      onClick={testServer}
                      disabled={loading.server}
                      className="d-flex align-items-center"
                    >
                      {loading.server ? (
                        <Spinner animation="border" size="sm" className="me-2" />
                      ) : (
                        <FaPlay className="me-2" />
                      )}
                      Probar
                    </Button>
                  </div>
                  <StatusIndicator status={status.server} />
                </Card.Body>
              </Card>
            </Col>

            {/* Test Base de Datos */}
            <Col md={4} className="mb-3">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center">
                      <FaDatabase className="text-success fs-4 me-2" />
                      <h5 className="mb-0 fw-semibold">Base de Datos</h5>
                    </div>
                    <Button
                      variant="success"
                      onClick={testDatabase}
                      disabled={loading.database}
                      className="d-flex align-items-center"
                    >
                      {loading.database ? (
                        <Spinner animation="border" size="sm" className="me-2" />
                      ) : (
                        <FaPlay className="me-2" />
                      )}
                      Probar
                    </Button>
                  </div>
                  <StatusIndicator status={status.database} />
                </Card.Body>
              </Card>
            </Col>

            {/* Test Tablas */}
            <Col md={4} className="mb-3">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center">
                      <FaTable className="text-info fs-4 me-2" />
                      <h5 className="mb-0 fw-semibold">Tablas</h5>
                    </div>
                    <Button
                      variant="info"
                      onClick={testTables}
                      disabled={loading.tables}
                      className="d-flex align-items-center"
                    >
                      {loading.tables ? (
                        <Spinner animation="border" size="sm" className="me-2" />
                      ) : (
                        <FaPlay className="me-2" />
                      )}
                      Verificar
                    </Button>
                  </div>
                  {status.tables && (
                    <div className="mt-3">
                      {Object.entries(status.tables).map(([table, tableStatus]) => (
                        <div key={table} className="d-flex justify-content-between align-items-center mb-1">
                          <Badge bg="light" text="dark" className="text-capitalize">{table}:</Badge>
                          <Badge bg={tableStatus.success ? 'success' : 'danger'}>
                            {tableStatus.success ? `${tableStatus.count} registros` : 'Error'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Panel de Acciones */}
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h3 className="fw-semibold mb-4">Acciones del Sistema</h3>
              <Row>
                <Col md={4} className="mb-3">
                  <Button
                    variant="warning"
                    onClick={runSeeders}
                    disabled={loading.seed}
                    className="w-100 d-flex align-items-center justify-content-center py-3"
                    size="lg"
                  >
                    {loading.seed ? (
                      <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                      <FaPlay className="me-2" />
                    )}
                    Ejecutar Seeders
                  </Button>
                </Col>

                <Col md={4} className="mb-3">
                  <Button
                    variant="primary"
                    onClick={loadData}
                    className="w-100 d-flex align-items-center justify-content-center py-3"
                    size="lg"
                  >
                    <FaDatabase className="me-2" />
                    Ver Datos
                  </Button>
                </Col>

                <Col md={4} className="mb-3">
                  <Button
                    variant="danger"
                    onClick={clearData}
                    disabled={loading.clear}
                    className="w-100 d-flex align-items-center justify-content-center py-3"
                    size="lg"
                  >
                    {loading.clear ? (
                      <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                      <FaTrash className="me-2" />
                    )}
                    Limpiar Datos
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Panel de Limpieza Individual de Tablas */}
          <Card className="mb-4 shadow-sm border-warning">
            <Card.Body>
              <h3 className="fw-semibold mb-3 text-warning">🗑️ Limpieza Individual de Tablas</h3>
              <p className="text-muted mb-4">
                Elimina todos los registros de una tabla específica. Útil para limpiar datos sin afectar otras tablas.
              </p>
              
              <Row>
                <Col md={4} className="mb-3">
                  <Button
                    variant="outline-danger"
                    onClick={() => clearSpecificTable('users', 'usuarios')}
                    disabled={loading.users}
                    className="w-100 d-flex align-items-center justify-content-center py-2"
                  >
                    {loading.users ? (
                      <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                      <FaTrash className="me-2" />
                    )}
                    Limpiar Usuarios
                  </Button>
                </Col>

                <Col md={4} className="mb-3">
                  <Button
                    variant="outline-danger"
                    onClick={() => clearSpecificTable('clients', 'clientes')}
                    disabled={loading.clients}
                    className="w-100 d-flex align-items-center justify-content-center py-2"
                  >
                    {loading.clients ? (
                      <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                      <FaTrash className="me-2" />
                    )}
                    Limpiar Clientes
                  </Button>
                </Col>

                <Col md={4} className="mb-3">
                  <Button
                    variant="outline-danger"
                    onClick={() => clearSpecificTable('trucks', 'camiones')}
                    disabled={loading.trucks}
                    className="w-100 d-flex align-items-center justify-content-center py-2"
                  >
                    {loading.trucks ? (
                      <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                      <FaTrash className="me-2" />
                    )}
                    Limpiar Camiones
                  </Button>
                </Col>

                <Col md={4} className="mb-3">
                  <Button
                    variant="outline-danger"
                    onClick={() => clearSpecificTable('repartos', 'repartos')}
                    disabled={loading.repartos}
                    className="w-100 d-flex align-items-center justify-content-center py-2"
                  >
                    {loading.repartos ? (
                      <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                      <FaTrash className="me-2" />
                    )}
                    Limpiar Repartos
                  </Button>
                </Col>

                <Col md={4} className="mb-3">
                  <Button
                    variant="outline-danger"
                    onClick={() => clearSpecificTable('diasEntrega', 'días de entrega')}
                    disabled={loading.diasEntrega}
                    className="w-100 d-flex align-items-center justify-content-center py-2"
                  >
                    {loading.diasEntrega ? (
                      <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                      <FaTrash className="me-2" />
                    )}
                    Limpiar Días
                  </Button>
                </Col>

                <Col md={4} className="mb-3">
                  <Button
                    variant="outline-danger"
                    onClick={() => clearSpecificTable('clientesporReparto', 'asignaciones')}
                    disabled={loading.clientesporReparto}
                    className="w-100 d-flex align-items-center justify-content-center py-2"
                  >
                    {loading.clientesporReparto ? (
                      <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                      <FaTrash className="me-2" />
                    )}
                    Limpiar Asignaciones
                  </Button>
                </Col>
              </Row>

              <Alert variant="warning" className="mt-3 mb-0">
                <strong>⚠️ Atención:</strong> La limpieza individual eliminará TODOS los registros de la tabla seleccionada. 
                Esta acción es irreversible.
              </Alert>
            </Card.Body>
          </Card>

          {/* Panel de Importación de Datos */}
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h3 className="fw-semibold mb-3">📊 Importación de Datos</h3>
              <p className="text-muted mb-4">
                Importa datos masivamente desde archivos Excel (.xlsx) a las tablas del sistema.
              </p>
              <Row>
                <Col md={6} className="mb-3">
                  <Card className="border-success h-100">
                    <Card.Body className="text-center">
                      <FaFileExcel className="text-success fs-1 mb-3" />
                      <h5 className="fw-semibold mb-3">Importar desde Excel</h5>
                      <p className="text-muted mb-4">
                        Carga datos de clientes, camiones y repartos desde archivos Excel
                      </p>
                      <Button
                        variant="success"
                        onClick={() => router.push('/import')}
                        className="w-100 d-flex align-items-center justify-content-center py-2"
                        size="lg"
                      >
                        <FaUpload className="me-2" />
                        Ir a Importación
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6} className="mb-3">
                  <Card className="border-info h-100">
                    <Card.Body>
                      <h6 className="fw-semibold mb-3">
                        <FaDatabase className="text-info me-2" />
                        Tablas Disponibles
                      </h6>
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        <Badge bg="primary">Clientes</Badge>
                        <Badge bg="success">Camiones</Badge>
                        <Badge bg="warning">Repartos</Badge>
                      </div>
                      <h6 className="fw-semibold mb-2">
                        <FaFileExcel className="text-success me-2" />
                        Funciones
                      </h6>
                      <ul className="list-unstyled small">
                        <li>✅ Plantillas Excel descargables</li>
                        <li>✅ Validación de datos automática</li>
                        <li>✅ Mapeo de columnas flexible</li>
                        <li>✅ Progreso de importación en tiempo real</li>
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Panel de Datos */}
          {showData && (
            <Card className="shadow-sm">
              <Card.Body>
                <h3 className="fw-semibold mb-4">Datos del Sistema</h3>
                {Object.entries(data).map(([table, tableData]) => (
                  <div key={table} className="mb-4">
                    <h4 className="fw-medium mb-3 text-capitalize">
                      {table} <Badge bg="secondary">{tableData.length} registros</Badge>
                    </h4>
                    {tableData.length > 0 ? (
                      <>
                        <Table striped bordered hover responsive>
                          <thead className="table-dark">
                            <tr>
                              {Object.keys(tableData[0]).map(key => (
                                <th key={key}>{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {tableData.slice(0, 5).map((row, index) => (
                              <tr key={index}>
                                {Object.values(row).map((value, valueIndex) => (
                                  <td key={valueIndex}>
                                    {String(value).length > 50 ? String(value).substring(0, 50) + '...' : String(value)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                        {tableData.length > 5 && (
                          <small className="text-muted fst-italic">
                            Mostrando 5 de {tableData.length} registros
                          </small>
                        )}
                      </>
                    ) : (
                      <Alert variant="info" className="text-center">
                        <em>No hay datos en esta tabla</em>
                      </Alert>
                    )}
                  </div>
                ))}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}

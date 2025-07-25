'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Spinner, Badge, ButtonGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { clientesporRepartoApi, clientApi, repartoApi } from '../../lib/api.js';

export default function ClientesporRepartoList() {
  const [clientesporReparto, setClientesporReparto] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [repartos, setRepartos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grouped'
  const [filterReparto, setFilterReparto] = useState('');
  const [filterCliente, setFilterCliente] = useState('');

  // Formulario
  const [formData, setFormData] = useState({
    reparto_id: '',
    cliente_ids: [] // Cambiado para múltiples clientes
  });

  // Estados para búsqueda y selección múltiple
  const [searchClient, setSearchClient] = useState('');
  const [selectedClients, setSelectedClients] = useState([]);

  // Cargar datos iniciales
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [clientesporRepartoData, clientesData, repartosData] = await Promise.all([
        clientesporRepartoApi.getAll(),
        clientApi.getAll(),
        repartoApi.getAll()
      ]);
      
      setClientesporReparto(Array.isArray(clientesporRepartoData) ? clientesporRepartoData : []);
      setClientes(Array.isArray(clientesData) ? clientesData : []);
      setRepartos(Array.isArray(repartosData) ? repartosData : []);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError(err.message || 'Error al cargar los datos');
      setClientesporReparto([]);
      setClientes([]);
      setRepartos([]);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  const loadFilteredData = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      if (filterReparto) filters.reparto = filterReparto;
      if (filterCliente) filters.cliente = filterCliente;
      
      const data = await clientesporRepartoApi.getAll(filters);
      setClientesporReparto(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error aplicando filtros:', err);
      setError(err.message || 'Error al filtrar los datos');
      setClientesporReparto([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    if (filterReparto || filterCliente) {
      loadFilteredData();
    } else {
      loadData();
    }
  }, [filterReparto, filterCliente]);

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reparto_id) {
      setError('Debe seleccionar un reparto');
      return;
    }
    
    if (selectedClients.length === 0) {
      setError('Debe seleccionar al menos un cliente');
      return;
    }

    try {
      setError(null);
      
      if (editingItem) {
        // Para edición, mantener el comportamiento original
        await clientesporRepartoApi.update(editingItem.id, {
          reparto_id: formData.reparto_id,
          cliente_id: selectedClients[0] // Tomar el primer cliente seleccionado
        });
      } else {
        // Para crear, hacer múltiples asignaciones
        const promises = selectedClients.map(clienteId => 
          clientesporRepartoApi.create({
            reparto_id: formData.reparto_id,
            cliente_id: clienteId
          })
        );
        await Promise.all(promises);
      }
      
      handleCancel();
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Manejar edición
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      reparto_id: item.reparto_id
    });
    setSelectedClients([item.cliente_id]);
    setShowForm(true);
  };

  // Manejar eliminación
  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta asignación?')) {
      try {
        await clientesporRepartoApi.delete(id);
        loadData();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Cancelar formulario
  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({ reparto_id: '', cliente_ids: [] });
    setSearchClient('');
    setSelectedClients([]);
  };

  // Filtrar clientes por búsqueda
  const filteredClients = clientes.filter(cliente => {
    if (!searchClient) return true;
    const searchTerm = searchClient.toLowerCase();
    return (
      (cliente.Nombre && cliente.Nombre.toLowerCase().includes(searchTerm)) ||
      (cliente.Razon && cliente.Razon.toLowerCase().includes(searchTerm)) ||
      (cliente.Ruc && cliente.Ruc.toLowerCase().includes(searchTerm)) ||
      (cliente.Codigo && cliente.Codigo.toLowerCase().includes(searchTerm))
    );
  });

  // Manejar selección de clientes
  const handleClientSelect = (clienteId, isSelected) => {
    setSelectedClients(prev => {
      if (isSelected) {
        return [...prev, clienteId];
      } else {
        return prev.filter(id => id !== clienteId);
      }
    });
  };

  // Seleccionar/deseleccionar todos los clientes filtrados
  const handleSelectAll = (selectAll) => {
    if (selectAll) {
      const allFilteredIds = filteredClients.map(cliente => cliente.id);
      setSelectedClients(prev => [...new Set([...prev, ...allFilteredIds])]);
    } else {
      const filteredIds = filteredClients.map(cliente => cliente.id);
      setSelectedClients(prev => prev.filter(id => !filteredIds.includes(id)));
    }
  };

  // Agrupar por reparto para vista agrupada
  const groupedData = Array.isArray(clientesporReparto) ? clientesporReparto.reduce((groups, item) => {
    const key = `${item.dia_descripcion} - ${item.camion_descripcion}`;
    if (!groups[key]) {
      groups[key] = {
        reparto: item,
        clientes: []
      };
    }
    groups[key].clientes.push(item);
    return groups;
  }, {}) : {};

  if (loading) return <div className="text-center py-4"><Spinner animation="border" /> Cargando asignaciones de clientes...</div>;
  if (error) return <Alert variant="danger">Error: {error}</Alert>;

  return (
    <Container fluid className="py-4">
      <Row>
        <Col xs={12}>
          <Card className="shadow">
            <Card.Header className="bg-white border-bottom-0 py-3">
              <Row className="align-items-center">
                <Col>
                  <h4 className="mb-0">
                    <i className="bi bi-boxes me-2"></i>
                    Asignación de Clientes por Reparto
                  </h4>
                </Col>
                <Col xs="auto">
                  <div className="d-flex gap-2">
                    <ButtonGroup>
                      <Button
                        variant={viewMode === 'table' ? 'primary' : 'outline-primary'}
                        onClick={() => setViewMode('table')}
                      >
                        Vista Tabla
                      </Button>
                      <Button
                        variant={viewMode === 'grouped' ? 'primary' : 'outline-primary'}
                        onClick={() => setViewMode('grouped')}
                      >
                        Vista Agrupada
                      </Button>
                    </ButtonGroup>
                    <Button
                      variant={showForm ? 'outline-secondary' : 'primary'}
                      onClick={() => setShowForm(!showForm)}
                    >
                      <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'} me-1`}></i>
                      {showForm ? 'Cancelar' : 'Agregar Asignación'}
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Header>

            <Card.Body>

          {/* Filtros */}
          <div className="row mb-4">
            <div className="col-md-6">
              <label className="form-label">Filtrar por Reparto:</label>
              <select
                className="form-select"
                value={filterReparto}
                onChange={(e) => setFilterReparto(e.target.value)}
              >
                <option value="">Todos los repartos</option>
                {repartos.map(reparto => (
                  <option key={reparto.id} value={reparto.id}>
                    {reparto.dia_descripcion} - {reparto.camion_descripcion}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Filtrar por Cliente:</label>
              <select
                className="form-select"
                value={filterCliente}
                onChange={(e) => setFilterCliente(e.target.value)}
              >
                <option value="">Todos los clientes</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre || cliente.Nombre || 'Sin nombre'} - {cliente.razon || cliente.Razon || 'Sin razón social'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vista Tabla */}
          {viewMode === 'table' && (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Día de Entrega</th>
                    <th>Camión</th>
                    <th>Cliente</th>
                    <th>Razón Social</th>
                    <th>Dirección</th>
                    <th>Teléfono</th>
                    <th>RUT</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientesporReparto.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4">
                        No hay asignaciones registradas
                      </td>
                    </tr>
                  ) : (
                    clientesporReparto.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>
                          <span className="badge bg-info">{item.dia_descripcion}</span>
                        </td>
                        <td>
                          <span className="badge bg-success">{item.camion_descripcion}</span>
                        </td>
                        <td>{item.cliente_nombre}</td>
                        <td>{item.cliente_razonsocial}</td>
                        <td>{item.cliente_direccion}</td>
                        <td>{item.cliente_telefono}</td>
                        <td>{item.cliente_rut}</td>
                        <td>
                          <ButtonGroup size="sm">
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Editar asignación</Tooltip>}
                            >
                              <Button
                                variant="outline-warning"
                                onClick={() => handleEdit(item)}
                              >
                                <i className="bi bi-pencil"></i>
                              </Button>
                            </OverlayTrigger>
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Eliminar asignación</Tooltip>}
                            >
                              <Button
                                variant="outline-danger"
                                onClick={() => handleDelete(item.id)}
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            </OverlayTrigger>
                          </ButtonGroup>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Vista Agrupada */}
          {viewMode === 'grouped' && (
            <div className="row">
              {Object.keys(groupedData).length === 0 ? (
                <div className="col-12 text-center py-4">
                  <p>No hay asignaciones registradas</p>
                </div>
              ) : (
                Object.entries(groupedData).map(([repartoKey, data]) => (
                  <div key={repartoKey} className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100">
                      <div className="card-header bg-primary text-white">
                        <h6 className="card-title mb-0">{repartoKey}</h6>
                        <small>Reparto ID: {data.reparto.reparto_id}</small>
                      </div>
                      <div className="card-body">
                        <h6>Clientes Asignados ({data.clientes.length}):</h6>
                        <ul className="list-group list-group-flush">
                          {data.clientes.map((cliente) => (
                            <li key={cliente.id} className="list-group-item d-flex justify-content-between align-items-start px-0">
                              <div className="flex-grow-1">
                                <div className="fw-bold">{cliente.cliente_nombre}</div>
                                <small className="text-muted">{cliente.cliente_razonsocial}</small>
                                <br />
                                <small className="text-muted">{cliente.cliente_direccion}</small>
                                <br />
                                <small className="text-muted">📞 {cliente.cliente_telefono}</small>
                                <br />
                                <small className="text-muted">RUT: {cliente.cliente_rut}</small>
                              </div>
                              <ButtonGroup size="sm" className="ms-2">
                                <OverlayTrigger
                                  placement="top"
                                  overlay={<Tooltip>Editar asignación</Tooltip>}
                                >
                                  <Button
                                    variant="outline-warning"
                                    size="sm"
                                    onClick={() => handleEdit(cliente)}
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </Button>
                                </OverlayTrigger>
                                <OverlayTrigger
                                  placement="top"
                                  overlay={<Tooltip>Eliminar asignación</Tooltip>}
                                >
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleDelete(cliente.id)}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </Button>
                                </OverlayTrigger>
                              </ButtonGroup>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Formulario Modal */}
          <Modal show={showForm} onHide={handleCancel} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>
                {editingItem ? 'Editar Asignación' : 'Nueva Asignación'}
              </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
                
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Reparto *</Form.Label>
                      <Form.Select
                        value={formData.reparto_id}
                        onChange={(e) => setFormData({...formData, reparto_id: e.target.value})}
                        required
                      >
                        <option value="">Seleccionar reparto</option>
                        {repartos.map(reparto => (
                          <option key={reparto.id} value={reparto.id}>
                            {reparto.dia_descripcion} - {reparto.camion_descripcion}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Clientes * 
                        <Badge bg="secondary" className="ms-2">
                          {selectedClients.length} seleccionados
                        </Badge>
                      </Form.Label>
                      
                      {/* Barra de búsqueda */}
                      <div className="input-group mb-2">
                        <span className="input-group-text">
                          <i className="bi bi-search"></i>
                        </span>
                        <Form.Control
                          type="text"
                          placeholder="Buscar cliente por nombre, razón social, RUT o código..."
                          value={searchClient}
                          onChange={(e) => setSearchClient(e.target.value)}
                        />
                      </div>

                      {/* Botones de selección */}
                      <div className="d-flex gap-2 mb-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleSelectAll(true)}
                          disabled={filteredClients.length === 0}
                        >
                          <i className="bi bi-check-all me-1"></i>
                          Seleccionar todos
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleSelectAll(false)}
                          disabled={selectedClients.length === 0}
                        >
                          <i className="bi bi-x-square me-1"></i>
                          Deseleccionar todos
                        </Button>
                      </div>

                      {/* Lista de clientes con checkboxes */}
                      <div className="border rounded p-2" style={{maxHeight: '300px', overflowY: 'auto'}}>
                        {filteredClients.length === 0 ? (
                          <div className="text-center text-muted py-3">
                            {searchClient ? 'No se encontraron clientes' : 'No hay clientes disponibles'}
                          </div>
                        ) : (
                          filteredClients.map(cliente => (
                            <div key={cliente.id} className="form-check py-1">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`cliente-${cliente.id}`}
                                checked={selectedClients.includes(cliente.id)}
                                onChange={(e) => handleClientSelect(cliente.id, e.target.checked)}
                              />
                              <label className="form-check-label" htmlFor={`cliente-${cliente.id}`}>
                                <div>
                                  <strong>{cliente.Nombre || 'Sin nombre'}</strong>
                                  {cliente.Razon && (
                                    <div className="text-muted small">
                                      {cliente.Razon}
                                    </div>
                                  )}
                                  {cliente.Ruc && (
                                    <div className="text-muted small">
                                      RUT: {cliente.Ruc}
                                    </div>
                                  )}
                                  {cliente.Codigo && (
                                    <div className="text-muted small">
                                      Código: {cliente.Codigo}
                                    </div>
                                  )}
                                </div>
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={!formData.reparto_id || selectedClients.length === 0}
                >
                  {editingItem ? 'Actualizar' : `Crear ${selectedClients.length} asignación${selectedClients.length !== 1 ? 'es' : ''}`}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

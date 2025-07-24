'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Spinner, Badge, ButtonGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { clientApi, handleApiError } from '../../lib/api.js';

// Importar el mapa de forma dinámica para evitar errores de SSR
const MapComponent = dynamic(() => import('./MapComponent.jsx'), {
  ssr: false,
  loading: () => <div className="text-center p-4"><Spinner animation="border" /></div>
});

const LocationPickerMap = dynamic(() => import('./LocationPickerMap.jsx'), {
  ssr: false,
  loading: () => <div className="text-center p-2"><Spinner animation="border" size="sm" /></div>
});

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  
  const [formData, setFormData] = useState({
    Codigo: '',
    Razon: '',
    Nombre: '',
    Direccion: '',
    Telefono1: '',
    Ruc: '',
    Activo: 1,
    Coordenada_x: 0,
    Coordenada_y: 0
  });

  const [filterText, setFilterText] = useState('');
  const [sortField, setSortField] = useState('Nombre');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showMap, setShowMap] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError('');
      const clients = await clientApi.getAll();
      
      // clientApi.getAll() ya devuelve directamente el array de clientes
      setClients(Array.isArray(clients) ? clients : []);
      
    } catch (error) {
      console.error('Error cargando clientes:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.Nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }
    if (!formData.Codigo.trim()) {
      setError('El código es requerido');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      let response;
      if (editingClient) {
        response = await clientApi.update({ ...formData, id: editingClient.id });
        setSuccess('Cliente actualizado exitosamente');
      } else {
        response = await clientApi.create(formData);
        setSuccess('Cliente creado exitosamente');
      }

      if (response.success) {
        resetForm();
        await loadClients();
      } else {
        throw new Error(response.error || 'Error en la operación');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      Codigo: '',
      Razon: '',
      Nombre: '',
      Direccion: '',
      Telefono1: '',
      Ruc: '',
      Activo: 1,
      Coordenada_x: 0,
      Coordenada_y: 0
    });
    setEditingClient(null);
    setShowForm(false);
  };

  // Editar cliente
  const handleEdit = (client) => {
    setFormData({
      Codigo: client.Codigo || '',
      Razon: client.Razon || '',
      Nombre: client.Nombre || '',
      Direccion: client.Direccion || '',
      Telefono1: client.Telefono1 || '',
      Ruc: client.Ruc || '',
      Activo: client.Activo || 1,
      Coordenada_x: client.Coordenada_x || 0,
      Coordenada_y: client.Coordenada_y || 0
    });
    setEditingClient(client);
    setShowForm(true);
  };

  // Eliminar cliente
  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Está seguro de eliminar el cliente "${nombre}"?`)) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await clientApi.delete(id);
      
      if (response.success) {
        setSuccess('Cliente eliminado exitosamente');
        await loadClients();
      } else {
        throw new Error(response.error || 'Error eliminando cliente');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  // Filtrar y ordenar clientes
  const getFilteredAndSortedClients = () => {
    let filtered = clients.filter(client => 
      (client.Nombre && client.Nombre.toLowerCase().includes(filterText.toLowerCase())) ||
      (client.Razon && client.Razon.toLowerCase().includes(filterText.toLowerCase())) ||
      (client.Ruc && client.Ruc.toLowerCase().includes(filterText.toLowerCase())) ||
      (client.Codigo && client.Codigo.toLowerCase().includes(filterText.toLowerCase()))
    );

    filtered.sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  };

  // Manejar ordenamiento
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleShowMap = (client) => {
    setSelectedClient(client);
    setShowMap(true);
  };

  const handleCloseMap = () => {
    setShowMap(false);
    setSelectedClient(null);
  };

  const handleLocationChange = (coordinates) => {
    setFormData(prev => ({
      ...prev,
      Coordenada_y: coordinates.latitude,
      Coordenada_x: coordinates.longitude
    }));
  };

  const filteredClients = getFilteredAndSortedClients();

  return (
    <Container fluid className="py-4">
      <Row>
        <Col xs={12}>
          <Card className="shadow">
            <Card.Header className="bg-white border-bottom-0 py-3">
              <Row className="align-items-center">
                <Col>
                  <h4 className="mb-0">
                    <i className="bi bi-people-fill me-2"></i>
                    Gestión de Clientes
                  </h4>
                </Col>
                <Col xs="auto">
                  <Button 
                    variant={showForm ? 'outline-secondary' : 'primary'}
                    onClick={() => setShowForm(!showForm)}
                    disabled={loading}
                  >
                    <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'} me-1`}></i>
                    {showForm ? 'Cancelar' : 'Agregar Cliente'}
                  </Button>
                </Col>
              </Row>
            </Card.Header>

            <Card.Body>
              {/* Mensajes */}
              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
              )}

              {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  {success}
                  <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                </div>
              )}

              {/* Formulario */}
              {showForm && (
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="Nombre" className="form-label">Nombre *</label>
                          <input
                            type="text"
                            className="form-control"
                            id="Nombre"
                            name="Nombre"
                            value={formData.Nombre}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="Codigo" className="form-label">Código Alternativo</label>
                          <input
                            type="text"
                            className="form-control"
                            id="Codigo"
                            name="Codigo"
                            value={formData.Codigo}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-8 mb-3">
                          <label htmlFor="Razon" className="form-label">Razón Social</label>
                          <input
                            type="text"
                            className="form-control"
                            id="Razon"
                            name="Razon"
                            value={formData.Razon}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label htmlFor="Ruc" className="form-label">RUT</label>
                          <input
                            type="text"
                            className="form-control"
                            id="Ruc"
                            name="Ruc"
                            value={formData.Ruc}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-8 mb-3">
                          <label htmlFor="Direccion" className="form-label">Dirección</label>
                          <input
                            type="text"
                            className="form-control"
                            id="Direccion"
                            name="Direccion"
                            value={formData.Direccion}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label htmlFor="Telefono1" className="form-label">Teléfono</label>
                          <input
                            type="text"
                            className="form-control"
                            id="Telefono1"
                            name="Telefono1"
                            value={formData.Telefono1}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label htmlFor="Coordenada_y" className="form-label">Latitud</label>
                          <input
                            type="number"
                            step="any"
                            className="form-control"
                            id="Coordenada_y"
                            name="Coordenada_y"
                            value={formData.Coordenada_y || ''}
                            onChange={handleInputChange}
                            readOnly
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label htmlFor="Coordenada_x" className="form-label">Longitud</label>
                          <input
                            type="number"
                            step="any"
                            className="form-control"
                            id="Coordenada_x"
                            name="Coordenada_x"
                            value={formData.Coordenada_x || ''}
                            onChange={handleInputChange}
                            readOnly
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label htmlFor="Activo" className="form-label">Estado</label>
                          <select
                            className="form-control"
                            id="Activo"
                            name="Activo"
                            value={formData.Activo}
                            onChange={handleInputChange}
                          >
                            <option value={1}>Activo</option>
                            <option value={0}>Inactivo</option>
                          </select>
                        </div>
                      </div>

                      {/* Mapa para seleccionar coordenadas */}
                      <div className="mb-3">
                        <label className="form-label">
                          <strong>📍 Seleccionar Ubicación en el Mapa</strong>
                        </label>
                        <LocationPickerMap
                          latitude={formData.Coordenada_y || -33.4489}
                          longitude={formData.Coordenada_x || -70.6693}
                          onLocationChange={handleLocationChange}
                          height="350px"
                        />
                      </div>

                      <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                          {loading ? 'Procesando...' : editingClient ? 'Actualizar' : 'Crear'}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={resetForm}>
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Filtros y Búsqueda */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por nombre, razón social, RUT o código..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
                </div>
                <div className="col-md-6 text-end">
                  <small className="text-muted">
                    Mostrando {filteredClients.length} de {clients.length} clientes
                  </small>
                </div>
              </div>

              {/* Tabla de Clientes */}
              <div className="table-responsive">
                <table className="table table-hover table-striped">
                  <thead className="table-light">
                    <tr>
                      <th 
                        scope="col" 
                        className="cursor-pointer" 
                        onClick={() => handleSort('id')}
                        style={{cursor: 'pointer'}}
                      >
                        ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        scope="col" 
                        className="cursor-pointer" 
                        onClick={() => handleSort('Codigo')}
                        style={{cursor: 'pointer'}}
                      >
                        Código {sortField === 'Codigo' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        scope="col" 
                        className="cursor-pointer" 
                        onClick={() => handleSort('Nombre')}
                        style={{cursor: 'pointer'}}
                      >
                        Nombre {sortField === 'Nombre' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        scope="col" 
                        className="cursor-pointer" 
                        onClick={() => handleSort('Razon')}
                        style={{cursor: 'pointer'}}
                      >
                        Razón Social {sortField === 'Razon' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th scope="col">Dirección</th>
                      <th scope="col">Teléfono</th>
                      <th scope="col">RUT</th>
                      <th scope="col">Estado</th>
                      <th scope="col">Ubicación</th>
                      <th scope="col">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="text-center text-muted py-4">
                          {loading ? (
                            <>
                              <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                              Cargando clientes...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-inbox fs-3 d-block mb-2"></i>
                              {clients.length === 0 ? 'No hay clientes registrados' : 'No se encontraron clientes'}
                            </>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredClients.map((client) => (
                        <tr key={client.id}>
                          <td><span className="badge bg-secondary">{client.id}</span></td>
                          <td>{client.Codigo || '-'}</td>
                          <td><strong>{client.Nombre}</strong></td>
                          <td>{client.Razon || '-'}</td>
                          <td className="text-truncate" style={{maxWidth: '200px'}} title={client.Direccion}>
                            {client.Direccion || '-'}
                          </td>
                          <td>{client.Telefono1 || '-'}</td>
                          <td>{client.Ruc || '-'}</td>
                          <td>
                            <span className={`badge ${client.Activo ? 'bg-success' : 'bg-danger'}`}>
                              {client.Activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="text-center">
                            {client.Coordenada_x && client.Coordenada_y ? (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleShowMap(client)}
                                title={`Ver ubicación: ${client.Coordenada_y.toFixed(4)}, ${client.Coordenada_x.toFixed(4)}`}
                                className="border-0"
                                style={{ width: '32px', height: '32px' }}
                              >
                                🟢
                              </Button>
                            ) : (
                              <Button
                                variant="danger"
                                size="sm"
                                disabled
                                title="Sin coordenadas de ubicación"
                                className="border-0"
                                style={{ width: '32px', height: '32px' }}
                              >
                                🔴
                              </Button>
                            )}
                          </td>
                          <td>
                            <ButtonGroup>
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Editar cliente</Tooltip>}
                              >
                                <Button
                                  onClick={() => handleEdit(client)}
                                  variant="outline-primary"
                                  size="sm"
                                  disabled={loading}
                                >
                                  <i className="bi bi-pencil"></i>
                                </Button>
                              </OverlayTrigger>
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Eliminar cliente</Tooltip>}
                              >
                                <Button
                                  onClick={() => handleDelete(client.id, client.Nombre)}
                                  variant="outline-danger"
                                  size="sm"
                                  disabled={loading}
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
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal para mostrar el mapa */}
      <Modal show={showMap} onHide={handleCloseMap} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            📍 Ubicación de {selectedClient?.Nombre}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedClient && (
            <>
              <div className="mb-3">
                <strong>Cliente:</strong> {selectedClient.Nombre}<br/>
                <strong>Dirección:</strong> {selectedClient.Direccion}<br/>
                <strong>Coordenadas:</strong> {selectedClient.Coordenada_y?.toFixed(6)}, {selectedClient.Coordenada_x?.toFixed(6)}
              </div>
              <div style={{ height: '400px', width: '100%' }}>
                <MapComponent 
                  latitude={selectedClient.Coordenada_y} 
                  longitude={selectedClient.Coordenada_x}
                  clientName={selectedClient.Nombre}
                  address={selectedClient.Direccion}
                />
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseMap}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ClientList;

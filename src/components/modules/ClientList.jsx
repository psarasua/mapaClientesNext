'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Spinner, Badge, ButtonGroup, OverlayTrigger, Tooltip, Pagination } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { handleApiError } from '../../lib/api.js';
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '../../hooks/useClients';
import LocationPickerMap from './LocationPickerMap.jsx';

// Importar el mapa de forma dinámica para evitar errores de SSR
const MapComponent = dynamic(() => import('./ClientMapComponent.jsx'), {
  ssr: false,
  loading: () => <div className="text-center p-4"><Spinner animation="border" /></div>
});

const ClientList = () => {
  // React Query hooks
  const { 
    data: clients = [], 
    isLoading, 
    error: queryError, 
    refetch 
  } = useClients();
  
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const deleteClientMutation = useDeleteClient();

  // Estados locales para el formulario y UI
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

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Combinar errores de React Query con errores locales
  const combinedError = queryError || error;

  // Manejar cambios en el formulario - Optimizado con useCallback
  const handleInputChange = useCallback((e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  }, []);

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
      setError('');
      setSuccess('');
      
      if (editingClient) {
        await updateClientMutation.mutateAsync({ ...formData, id: editingClient.id });
        setSuccess('Cliente actualizado exitosamente');
      } else {
        await createClientMutation.mutateAsync(formData);
        setSuccess('Cliente creado exitosamente');
      }

      resetForm();
      
    } catch (error) {
      console.error('Error:', error);
      setError(handleApiError(error));
    }
  };

  // Resetear formulario - Optimizado con useCallback
  const resetForm = useCallback(() => {
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
  }, []);

  // Editar cliente - Optimizado con useCallback
  const handleEdit = useCallback((client) => {
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
  }, []);

  // Eliminar cliente - Optimizado con useCallback
  const handleDelete = useCallback(async (id, nombre) => {
    if (!window.confirm(`¿Está seguro de eliminar el cliente "${nombre}"?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      await deleteClientMutation.mutateAsync(id);
      setSuccess('Cliente eliminado exitosamente');
      
    } catch (error) {
      console.error('Error:', error);
      setError(handleApiError(error));
    }
  }, [deleteClientMutation]);

  // Filtrar y ordenar clientes - Optimizado con useMemo
  const filteredAndSortedClients = useMemo(() => {
    if (!clients || clients.length === 0) return [];
    
    // Primero filtrar
    let filtered = clients.filter(client => {
      const searchText = filterText.toLowerCase();
      return (
        (client.Nombre && client.Nombre.toLowerCase().includes(searchText)) ||
        (client.Razon && client.Razon.toLowerCase().includes(searchText)) ||
        (client.Ruc && client.Ruc.toLowerCase().includes(searchText)) ||
        (client.Codigo && client.Codigo.toLowerCase().includes(searchText))
      );
    });

    // Luego ordenar
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
  }, [clients, filterText, sortField, sortDirection]);

  // Calcular datos de paginación
  const totalPages = Math.ceil(filteredAndSortedClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = filteredAndSortedClients.slice(startIndex, endIndex);

  // Resetear página al cambiar filtro
  const handleFilterChange = useCallback((e) => {
    setFilterText(e.target.value);
    setCurrentPage(1); // Resetear a la primera página
  }, []);

  // Manejar ordenamiento - Optimizado con useCallback
  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

  const handleShowMap = useCallback((client) => {
    setSelectedClient(client);
    setShowMap(true);
  }, []);

  const handleCloseMap = useCallback(() => {
    setShowMap(false);
    setSelectedClient(null);
  }, []);

  const handleLocationChange = (coordinates) => {
    setFormData(prev => ({
      ...prev,
      Coordenada_y: coordinates.latitude,
      Coordenada_x: coordinates.longitude
    }));
  };

  // Usar los clientes filtrados y ordenados con paginación
  const filteredClients = currentClients;

  // Mostrar loading inicial
  if (isLoading) {
    return (
      <Container fluid className="py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted">Cargando clientes...</p>
          </div>
        </div>
      </Container>
    );
  }

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
                    disabled={isLoading || createClientMutation.isPending || updateClientMutation.isPending}
                  >
                    <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'} me-1`}></i>
                    {showForm ? 'Cancelar' : 'Agregar Cliente'}
                  </Button>
                </Col>
              </Row>
            </Card.Header>

            <Card.Body>
              {/* Mensajes */}
              {combinedError && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {typeof combinedError === 'string' ? combinedError : handleApiError(combinedError)}
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
                        <button 
                          type="submit" 
                          className="btn btn-primary" 
                          disabled={createClientMutation.isPending || updateClientMutation.isPending}
                        >
                          {(createClientMutation.isPending || updateClientMutation.isPending) ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              {editingClient ? 'Actualizando...' : 'Creando...'}
                            </>
                          ) : (
                            editingClient ? 'Actualizar' : 'Crear'
                          )}
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
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="col-md-6 text-end">
                  <small className="text-muted">
                    Mostrando {startIndex + 1}-{Math.min(endIndex, filteredAndSortedClients.length)} de {filteredAndSortedClients.length} clientes filtrados ({clients.length} total)
                  </small>
                </div>
              </div>

              {/* Tabla de Clientes */}
              <div className="table-responsive">
                <table className="table table-hover table-striped w-100">
                  <thead className="table-light">
                    <tr>
                      <th 
                        scope="col" 
                        className="cursor-pointer" 
                        onClick={() => handleSort('id')}
                        style={{cursor: 'pointer', width: '4%', minWidth: '45px'}}
                      >
                        ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        scope="col" 
                        className="cursor-pointer" 
                        onClick={() => handleSort('Codigo')}
                        style={{cursor: 'pointer', width: '8%', minWidth: '75px'}}
                      >
                        Código {sortField === 'Codigo' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        scope="col" 
                        className="cursor-pointer" 
                        onClick={() => handleSort('Nombre')}
                        style={{cursor: 'pointer', width: '17%', minWidth: '130px'}}
                      >
                        Nombre {sortField === 'Nombre' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        scope="col" 
                        className="cursor-pointer" 
                        onClick={() => handleSort('Razon')}
                        style={{cursor: 'pointer', width: '17%', minWidth: '130px'}}
                      >
                        Razón Social {sortField === 'Razon' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th scope="col" style={{width: '22%', minWidth: '150px'}}>Dirección</th>
                      <th scope="col" style={{width: '11%', minWidth: '95px'}}>Teléfono</th>
                      <th scope="col" style={{width: '12%', minWidth: '105px'}}>RUT</th>
                      <th scope="col" style={{width: '6%', minWidth: '65px'}}>Estado</th>
                      <th scope="col" style={{width: '4%', minWidth: '65px'}}>Ubicación</th>
                      <th scope="col" style={{width: '9%', minWidth: '105px'}}>Acciones</th>
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
                      filteredClients.map((client, index) => (
                        <tr key={`client-${client.id || index}-${client.Nombre?.slice(0, 10) || 'unknown'}`}>
                          <td style={{width: '4%', minWidth: '45px'}}><span className="badge bg-secondary">{client.id || 'N/A'}</span></td>
                          <td style={{width: '8%', minWidth: '75px'}}><small>{client.Codigo || '-'}</small></td>
                          <td style={{width: '17%', minWidth: '130px'}}><strong>{client.Nombre || 'Sin nombre'}</strong></td>
                          <td style={{width: '17%', minWidth: '130px'}}>{client.Razon || '-'}</td>
                          <td className="text-truncate" style={{width: '22%', minWidth: '150px'}} title={client.Direccion}>
                            {client.Direccion || '-'}
                          </td>
                          <td style={{width: '11%', minWidth: '95px'}}><small>{client.Telefono1 || '-'}</small></td>
                          <td style={{width: '12%', minWidth: '105px'}}><small>{client.Ruc || '-'}</small></td>
                          <td style={{width: '6%', minWidth: '65px'}}>
                            <span className={`badge ${client.Activo ? 'bg-success' : 'bg-danger'}`}>
                              {client.Activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="text-center" style={{width: '4%', minWidth: '65px'}}>
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
                          <td style={{width: '9%', minWidth: '105px'}}>
                            <ButtonGroup>
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Editar cliente</Tooltip>}
                              >
                                <Button
                                  onClick={() => handleEdit(client)}
                                  variant="outline-primary"
                                  size="sm"
                                  disabled={isLoading || createClientMutation.isPending || updateClientMutation.isPending}
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
                                  disabled={deleteClientMutation.isPending}
                                >
                                  {deleteClientMutation.isPending && deleteClientMutation.variables === client.id ? (
                                    <div className="spinner-border spinner-border-sm" role="status"></div>
                                  ) : (
                                    <i className="bi bi-trash"></i>
                                  )}
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

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                  <div className="pagination-info">
                    <small className="text-muted">
                      Página {currentPage} de {totalPages} • Total: {filteredAndSortedClients.length} clientes
                    </small>
                  </div>
                  <Pagination className="mb-0">
                    <Pagination.First 
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev 
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    />
                    
                    {/* Páginas numéricas */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Pagination.Item
                          key={pageNum}
                          active={pageNum === currentPage}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Pagination.Item>
                      );
                    })}
                    
                    <Pagination.Next 
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last 
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
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

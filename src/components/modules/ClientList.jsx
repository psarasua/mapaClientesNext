'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Spinner, Badge, ButtonGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { clientApi, handleApiError } from '../../lib/api.js';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  
  const [formData, setFormData] = useState({
    codigoalternativo: '',
    razonsocial: '',
    nombre: '',
    direccion: '',
    telefono: '',
    rut: '',
    activo: 1,
    latitud: 0,
    longitud: 0
  });

  const [filterText, setFilterText] = useState('');
  const [sortField, setSortField] = useState('nombre');
  const [sortDirection, setSortDirection] = useState('asc');

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await clientApi.getAll();
      
      if (response.success) {
        setClients(response.clients || []);
        if (response.source) {
          console.log('Fuente de datos:', response.source);
        }
      } else {
        throw new Error(response.error || 'Error cargando clientes');
      }
    } catch (error) {
      console.error('Error:', error);
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
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
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
      codigoalternativo: '',
      razonsocial: '',
      nombre: '',
      direccion: '',
      telefono: '',
      rut: '',
      activo: 1,
      latitud: 0,
      longitud: 0
    });
    setEditingClient(null);
    setShowForm(false);
  };

  // Editar cliente
  const handleEdit = (client) => {
    setFormData({
      codigoalternativo: client.codigoalternativo || '',
      razonsocial: client.razonsocial || '',
      nombre: client.nombre || '',
      direccion: client.direccion || '',
      telefono: client.telefono || '',
      rut: client.rut || '',
      activo: client.activo || 1,
      latitud: client.latitud || 0,
      longitud: client.longitud || 0
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
      client.nombre.toLowerCase().includes(filterText.toLowerCase()) ||
      client.razonsocial.toLowerCase().includes(filterText.toLowerCase()) ||
      client.rut.toLowerCase().includes(filterText.toLowerCase()) ||
      (client.codigoalternativo && client.codigoalternativo.toLowerCase().includes(filterText.toLowerCase()))
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

  const filteredClients = getFilteredAndSortedClients();

  return (
    <Container fluid className="py-4">
      <Row>
        <Col xs={12}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <Row className="align-items-center">
                <Col>
                  <h4 className="mb-0">
                    <i className="bi bi-people-fill me-2"></i>
                    Gestión de Clientes
                  </h4>
                </Col>
                <Col xs="auto">
                  <Button 
                    variant="light"
                    onClick={() => setShowForm(!showForm)}
                    disabled={loading}
                  >
                    {showForm ? 'Cancelar' : 'Agregar Cliente'}
                  </Button>
                  <Button 
                    variant="outline-light"
                    className="ms-2"
                    onClick={loadClients}
                    disabled={loading}
                  >
                    {loading ? 'Cargando...' : 'Actualizar'}
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
                          <label htmlFor="nombre" className="form-label">Nombre *</label>
                          <input
                            type="text"
                            className="form-control"
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="codigoalternativo" className="form-label">Código Alternativo</label>
                          <input
                            type="text"
                            className="form-control"
                            id="codigoalternativo"
                            name="codigoalternativo"
                            value={formData.codigoalternativo}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-8 mb-3">
                          <label htmlFor="razonsocial" className="form-label">Razón Social</label>
                          <input
                            type="text"
                            className="form-control"
                            id="razonsocial"
                            name="razonsocial"
                            value={formData.razonsocial}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label htmlFor="rut" className="form-label">RUT</label>
                          <input
                            type="text"
                            className="form-control"
                            id="rut"
                            name="rut"
                            value={formData.rut}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-8 mb-3">
                          <label htmlFor="direccion" className="form-label">Dirección</label>
                          <input
                            type="text"
                            className="form-control"
                            id="direccion"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label htmlFor="telefono" className="form-label">Teléfono</label>
                          <input
                            type="text"
                            className="form-control"
                            id="telefono"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label htmlFor="latitud" className="form-label">Latitud</label>
                          <input
                            type="number"
                            step="any"
                            className="form-control"
                            id="latitud"
                            name="latitud"
                            value={formData.latitud}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label htmlFor="longitud" className="form-label">Longitud</label>
                          <input
                            type="number"
                            step="any"
                            className="form-control"
                            id="longitud"
                            name="longitud"
                            value={formData.longitud}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label htmlFor="activo" className="form-label">Estado</label>
                          <select
                            className="form-control"
                            id="activo"
                            name="activo"
                            value={formData.activo}
                            onChange={handleInputChange}
                          >
                            <option value={1}>Activo</option>
                            <option value={0}>Inactivo</option>
                          </select>
                        </div>
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
                  <thead className="table-dark">
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
                        onClick={() => handleSort('codigoalternativo')}
                        style={{cursor: 'pointer'}}
                      >
                        Código {sortField === 'codigoalternativo' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        scope="col" 
                        className="cursor-pointer" 
                        onClick={() => handleSort('nombre')}
                        style={{cursor: 'pointer'}}
                      >
                        Nombre {sortField === 'nombre' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        scope="col" 
                        className="cursor-pointer" 
                        onClick={() => handleSort('razonsocial')}
                        style={{cursor: 'pointer'}}
                      >
                        Razón Social {sortField === 'razonsocial' && (sortDirection === 'asc' ? '↑' : '↓')}
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
                          <td>{client.codigoalternativo || '-'}</td>
                          <td><strong>{client.nombre}</strong></td>
                          <td>{client.razonsocial || '-'}</td>
                          <td className="text-truncate" style={{maxWidth: '200px'}} title={client.direccion}>
                            {client.direccion || '-'}
                          </td>
                          <td>{client.telefono || '-'}</td>
                          <td>{client.rut || '-'}</td>
                          <td>
                            <span className={`badge ${client.activo ? 'bg-success' : 'bg-danger'}`}>
                              {client.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td>
                            {client.latitud && client.longitud ? (
                              <small className="text-muted">
                                {client.latitud.toFixed(4)}, {client.longitud.toFixed(4)}
                              </small>
                            ) : '-'}
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEdit(client)}
                                disabled={loading}
                                title="Editar cliente"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(client.id, client.nombre)}
                                disabled={loading}
                                title="Eliminar cliente"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
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
    </Container>
  );
};

export default ClientList;

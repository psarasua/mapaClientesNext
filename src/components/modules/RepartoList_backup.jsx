'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Spinner, Badge, ButtonGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { repartoApi, diaEntregaApi, truckApi, handleApiError } from '../../lib/api.js';

const RepartoList = () => {
  const [repartos, setRepartos] = useState([]);
  const [diasEntrega, setDiasEntrega] = useState([]);
  const [camiones, setCamiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingReparto, setEditingReparto] = useState(null);
  
  const [formData, setFormData] = useState({
    diasEntrega_id: '',
    camion_id: ''
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Cargar repartos, días y camiones en paralelo
      const [repartosResponse, diasResponse, camionesResponse] = await Promise.all([
        repartoApi.getAll(),
        diaEntregaApi.getAll(),
        truckApi.getAll()
      ]);

      if (repartosResponse.success) {
        setRepartos(repartosResponse.repartos || []);
      }
      if (diasResponse.success) {
        setDiasEntrega(diasResponse.diasEntrega || []);
      }
      if (camionesResponse.success) {
        setCamiones(camionesResponse.trucks || []);
      }

      if (repartosResponse.source) {
        console.log('Fuente de datos repartos:', repartosResponse.source);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const loadRepartos = async () => {
    try {
      setError('');
      const response = await repartoApi.getAll();
      
      if (response.success) {
        setRepartos(response.repartos || []);
      } else {
        throw new Error(response.error || 'Error cargando repartos');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(handleApiError(error));
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value) || ''
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.diasEntrega_id || !formData.camion_id) {
      setError('El día de entrega y el camión son requeridos');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      let response;
      if (editingReparto) {
        response = await repartoApi.update({ ...formData, id: editingReparto.id });
        setSuccess('Reparto actualizado exitosamente');
      } else {
        response = await repartoApi.create(formData);
        setSuccess('Reparto creado exitosamente');
      }

      if (response.success) {
        resetForm();
        await loadRepartos();
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
      diasEntrega_id: '',
      camion_id: ''
    });
    setEditingReparto(null);
    setShowForm(false);
  };

  // Editar reparto
  const handleEdit = (reparto) => {
    setFormData({
      diasEntrega_id: reparto.diasEntrega_id,
      camion_id: reparto.camion_id
    });
    setEditingReparto(reparto);
    setShowForm(true);
  };

  // Eliminar reparto
  const handleDelete = async (id, dia, camion) => {
    if (!window.confirm(`¿Está seguro de eliminar el reparto "${dia} - ${camion}"?`)) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await repartoApi.delete(id);
      
      if (response.success) {
        setSuccess('Reparto eliminado exitosamente');
        await loadRepartos();
      } else {
        throw new Error(response.error || 'Error eliminando reparto');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  // Filtrar y ordenar repartos
  const getFilteredAndSortedRepartos = () => {
    let filtered = [...repartos];

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

  // Generar matriz de repartos por día y camión
  const getMatrixView = () => {
    const matrix = {};
    
    // Inicializar matriz
    diasEntrega.forEach(dia => {
      matrix[dia.id] = {
        dia: dia.descripcion,
        camiones: {}
      };
      camiones.forEach(camion => {
        matrix[dia.id].camiones[camion.id] = null;
      });
    });

    // Llenar matriz con repartos
    repartos.forEach(reparto => {
      if (matrix[reparto.diasEntrega_id]) {
        matrix[reparto.diasEntrega_id].camiones[reparto.camion_id] = reparto;
      }
    });

    return matrix;
  };

  const matrixView = getMatrixView();

  return (
    <Container fluid className="py-4">
      <Row>
        <Col xs={12}>
          <Card className="shadow">
            <Card.Header className="bg-white border-bottom-0 py-3">
              <Row className="align-items-center">
                <Col>
                  <h4 className="mb-0">
                    <i className="bi bi-truck-flatbed me-2"></i>
                    Gestión de Repartos
                  </h4>
                </Col>
                <Col xs="auto">
                  <Button 
                    variant={showForm ? 'outline-secondary' : 'primary'}
                    onClick={() => setShowForm(!showForm)}
                    disabled={loading}
                  >
                    <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'} me-1`}></i>
                    {showForm ? 'Cancelar' : 'Agregar Reparto'}
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
                    <h5 className="mb-0">{editingReparto ? 'Editar Reparto' : 'Nuevo Reparto'}</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="diasEntrega_id" className="form-label">Día de Entrega *</label>
                          <select
                            className="form-control"
                            id="diasEntrega_id"
                            name="diasEntrega_id"
                            value={formData.diasEntrega_id}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Seleccionar día...</option>
                            {diasEntrega.map(dia => (
                              <option key={dia.id} value={dia.id}>{dia.descripcion}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="camion_id" className="form-label">Camión *</label>
                          <select
                            className="form-control"
                            id="camion_id"
                            name="camion_id"
                            value={formData.camion_id}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Seleccionar camión...</option>
                            {camiones.map(camion => (
                              <option key={camion.id} value={camion.id}>{camion.description}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-warning" disabled={loading}>
                          {loading ? 'Procesando...' : editingReparto ? 'Actualizar' : 'Crear'}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={resetForm}>
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Vista de Matriz */}
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Día / Camión</th>
                      {camiones.map(camion => (
                        <th key={camion.id} className="text-center" style={{minWidth: '120px'}}>
                          <div className="text-truncate" title={camion.description}>
                            <i className="bi bi-truck me-1"></i>
                            {camion.description}
                          </div>
                    <select
                      className="form-control"
                      value={filterDia}
                      onChange={(e) => setFilterDia(e.target.value)}
                    >
                      <option value="">Todos los días</option>
                      {diasEntrega.map(dia => (
                        <option key={dia.id} value={dia.id}>{dia.descripcion}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-control"
                      value={filterCamion}
                      onChange={(e) => setFilterCamion(e.target.value)}
                    >
                      <option value="">Todos los camiones</option>
                      {camiones.map(camion => (
                        <option key={camion.id} value={camion.id}>{camion.description}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2 text-end">
                    <small className="text-muted">
                      {filteredRepartos.length} de {repartos.length}
                    </small>
                  </div>
                </div>

              {/* Vista de Tabla */}
              {viewMode === 'table' && (
                <div className="table-responsive">
                  <table className="table table-hover table-striped">
                    <thead className="table-light">
                      <tr>
                        <th scope="col" className="text-center">ID</th>
                        <th 
                          scope="col" 
                          className="cursor-pointer" 
                          onClick={() => handleSort('dia_descripcion')}
                          style={{cursor: 'pointer'}}
                        >
                          Día {sortField === 'dia_descripcion' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                          scope="col" 
                          className="cursor-pointer" 
                          onClick={() => handleSort('camion_descripcion')}
                          style={{cursor: 'pointer'}}
                        >
                          Camión {sortField === 'camion_descripcion' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th scope="col" className="text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRepartos.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center text-muted py-4">
                            {loading ? (
                              <>
                                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                Cargando repartos...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-inbox fs-3 d-block mb-2"></i>
                                {repartos.length === 0 ? 'No hay repartos registrados' : 'No se encontraron repartos'}
                              </>
                            )}
                          </td>
                        </tr>
                      ) : (
                        filteredRepartos.map((reparto) => (
                          <tr key={reparto.id}>
                            <td className="text-center">
                              <span className="badge bg-secondary">{reparto.id}</span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <i className="bi bi-calendar-day me-2 text-success"></i>
                                <strong>{reparto.dia_descripcion}</strong>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <i className="bi bi-truck me-2 text-primary"></i>
                                <span>{reparto.camion_descripcion}</span>
                              </div>
                            </td>
                            <td className="text-center">
                              <ButtonGroup>
                                <OverlayTrigger
                                  placement="top"
                                  overlay={<Tooltip>Editar reparto</Tooltip>}
                                >
                                  <Button
                                    onClick={() => handleEdit(reparto)}
                                    variant="outline-primary"
                                    size="sm"
                                    disabled={loading}
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </Button>
                                </OverlayTrigger>
                                <OverlayTrigger
                                  placement="top"
                                  overlay={<Tooltip>Eliminar reparto</Tooltip>}
                                >
                                  <Button
                                    onClick={() => handleDelete(reparto.id, reparto.dia_descripcion, reparto.camion_descripcion)}
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
              )}

              {/* Vista de Matriz */}
              <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Día / Camión</th>
                        {camiones.map(camion => (
                          <th key={camion.id} className="text-center" style={{minWidth: '120px'}}>
                            <div className="text-truncate" title={camion.description}>
                              <i className="bi bi-truck me-1"></i>
                              {camion.description}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(matrixView).map((row, index) => (
                        <tr key={index}>
                          <td className="fw-bold bg-light">
                            <i className="bi bi-calendar-day me-2"></i>
                            {row.dia}
                          </td>
                          {camiones.map(camion => {
                            const reparto = row.camiones[camion.id];
                            return (
                              <td key={camion.id} className="text-center p-2">
                                {reparto ? (
                                  <div className="d-grid gap-1">
                                    <span className="badge bg-success">
                                      <i className="bi bi-check-circle me-1"></i>
                                      Asignado
                                    </span>
                                    <ButtonGroup size="sm">
                                      <OverlayTrigger
                                        placement="top"
                                        overlay={<Tooltip>Editar</Tooltip>}
                                      >
                                        <Button
                                          variant="outline-primary"
                                          size="sm"
                                          onClick={() => handleEdit(reparto)}
                                        >
                                          <i className="bi bi-pencil"></i>
                                        </Button>
                                      </OverlayTrigger>
                                      <OverlayTrigger
                                        placement="top"
                                        overlay={<Tooltip>Eliminar</Tooltip>}
                                      >
                                        <Button
                                          variant="outline-danger"
                                          size="sm"
                                          onClick={() => handleDelete(reparto.id, row.dia, camion.description)}
                                        >
                                          <i className="bi bi-trash"></i>
                                        </Button>
                                      </OverlayTrigger>
                                    </ButtonGroup>
                                  </div>
                                ) : (
                                  <span className="badge bg-light text-muted">
                                    <i className="bi bi-dash"></i>
                                    Sin asignar
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
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

export default RepartoList;

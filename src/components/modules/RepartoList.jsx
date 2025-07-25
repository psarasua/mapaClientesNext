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

    } catch (error) {
      console.error('Error loading data:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.diasEntrega_id || !formData.camion_id) {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = editingReparto 
        ? await repartoApi.update({ id: editingReparto.id, ...formData })
        : await repartoApi.create(formData);

      if (response.success) {
        setSuccess(editingReparto ? 'Reparto actualizado exitosamente' : 'Reparto creado exitosamente');
        resetForm();
        loadAllData();
      } else {
        throw new Error(response.error || 'Error al procesar reparto');
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
    setError('');
    setSuccess('');
  };

  // Editar reparto
  const handleEdit = (reparto) => {
    setEditingReparto(reparto);
    setFormData({
      diasEntrega_id: reparto.diasEntrega_id?.toString() || '',
      camion_id: reparto.camion_id?.toString() || ''
    });
    setShowForm(true);
  };

  // Eliminar reparto
  const handleDelete = async (id, diaDescripcion, camionDescripcion) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el reparto "${diaDescripcion} - ${camionDescripcion}"?`)) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await repartoApi.delete(id);

      if (response.success) {
        setSuccess('Reparto eliminado exitosamente');
        loadAllData();
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

  // Crear vista de matriz día-camión
  const getMatrixView = () => {
    const matrix = {};
    
    diasEntrega.forEach(dia => {
      matrix[dia.id] = {
        dia: dia.descripcion,
        camiones: {}
      };
    });

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
                          <label htmlFor="diasEntrega_id" className="form-label">
                            Día de Entrega *
                          </label>
                          <select
                            className="form-control"
                            id="diasEntrega_id"
                            name="diasEntrega_id"
                            value={formData.diasEntrega_id}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Selecciona un día</option>
                            {diasEntrega.map(dia => (
                              <option key={dia.id} value={dia.id}>{dia.descripcion}</option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="camion_id" className="form-label">
                            Camión *
                          </label>
                          <select
                            className="form-control"
                            id="camion_id"
                            name="camion_id"
                            value={formData.camion_id}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Selecciona un camión</option>
                            {camiones.map(camion => (
                              <option key={camion.id} value={camion.id}>{camion.description}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
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
              {repartos.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-truck-flatbed" style={{fontSize: '3rem', color: '#6c757d'}}></i>
                  <h5 className="mt-3 text-muted">No hay repartos configurados</h5>
                  <p className="text-muted">Crea el primer reparto asignando un día de entrega a un camión.</p>
                  <Button 
                    variant="primary" 
                    onClick={() => setShowForm(true)}
                    className="mt-2"
                  >
                    <i className="bi bi-plus-lg me-2"></i>
                    Crear Primer Reparto
                  </Button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Día / Camión</th>
                        {camiones.map(camion => (
                          <th key={camion.id} className="text-center" style={{minWidth: '150px'}}>
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
                              <td key={camion.id} className="text-center align-middle" style={{minHeight: '80px'}}>
                                {reparto ? (
                                  <div className="d-flex flex-column gap-2">
                                    <Badge bg="success" className="py-2">
                                      <i className="bi bi-check-circle me-1"></i>
                                      Asignado
                                    </Badge>
                                    <ButtonGroup size="sm" className="w-100">
                                      <OverlayTrigger
                                        placement="top"
                                        overlay={<Tooltip>Editar reparto</Tooltip>}
                                      >
                                        <Button
                                          variant="outline-primary"
                                          size="sm"
                                          onClick={() => handleEdit(reparto)}
                                          className="px-3"
                                        >
                                          <i className="bi bi-pencil-square"></i>
                                        </Button>
                                      </OverlayTrigger>
                                      <OverlayTrigger
                                        placement="top"
                                        overlay={<Tooltip>Eliminar reparto</Tooltip>}
                                      >
                                        <Button
                                          variant="outline-danger"
                                          size="sm"
                                          onClick={() => handleDelete(reparto.id, row.dia, camion.description)}
                                          className="px-3"
                                        >
                                          <i className="bi bi-trash3"></i>
                                        </Button>
                                      </OverlayTrigger>
                                    </ButtonGroup>
                                  </div>
                                ) : (
                                  <div className="d-flex flex-column gap-2">
                                    <Badge bg="light" text="dark" className="py-2">
                                      <i className="bi bi-circle me-1"></i>
                                      Sin asignar
                                    </Badge>
                                    <Button
                                      variant="outline-success"
                                      size="sm"
                                      onClick={() => {
                                        const diaId = diasEntrega.find(d => d.descripcion === row.dia)?.id;
                                        setFormData({
                                          diasEntrega_id: diaId?.toString() || '',
                                          camion_id: camion.id.toString()
                                        });
                                        setShowForm(true);
                                      }}
                                      className="w-100"
                                      title="Crear reparto para este día y camión"
                                    >
                                      <i className="bi bi-plus-lg"></i>
                                    </Button>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RepartoList;

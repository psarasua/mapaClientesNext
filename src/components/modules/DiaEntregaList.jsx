'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Spinner, Badge, ButtonGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { diaEntregaApi, handleApiError } from '../../lib/api.js';

const DiaEntregaList = () => {
  const [diasEntrega, setDiasEntrega] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDiaEntrega, setEditingDiaEntrega] = useState(null);
  
  const [formData, setFormData] = useState({
    descripcion: ''
  });

  const [filterText, setFilterText] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  // Cargar días de entrega al montar el componente
  useEffect(() => {
    loadDiasEntrega();
  }, []);

  const loadDiasEntrega = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await diaEntregaApi.getAll();
      
      if (response.success) {
        setDiasEntrega(response.diasEntrega || []);
        if (response.source) {
          console.log('Fuente de datos:', response.source);
        }
      } else {
        throw new Error(response.error || 'Error cargando días de entrega');
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.descripcion.trim()) {
      setError('La descripción es requerida');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      let response;
      if (editingDiaEntrega) {
        response = await diaEntregaApi.update({ ...formData, id: editingDiaEntrega.id });
        setSuccess('Día de entrega actualizado exitosamente');
      } else {
        response = await diaEntregaApi.create(formData);
        setSuccess('Día de entrega creado exitosamente');
      }

      if (response.success) {
        resetForm();
        await loadDiasEntrega();
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
      descripcion: ''
    });
    setEditingDiaEntrega(null);
    setShowForm(false);
  };

  // Editar día de entrega
  const handleEdit = (diaEntrega) => {
    setFormData({
      descripcion: diaEntrega.descripcion || ''
    });
    setEditingDiaEntrega(diaEntrega);
    setShowForm(true);
  };

  // Eliminar día de entrega
  const handleDelete = async (id, descripcion) => {
    if (!window.confirm(`¿Está seguro de eliminar el día "${descripcion}"?`)) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await diaEntregaApi.delete(id);
      
      if (response.success) {
        setSuccess('Día de entrega eliminado exitosamente');
        await loadDiasEntrega();
      } else {
        throw new Error(response.error || 'Error eliminando día de entrega');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  // Filtrar y ordenar días de entrega
  const getFilteredAndSortedDiasEntrega = () => {
    let filtered = diasEntrega.filter(dia => 
      dia.descripcion.toLowerCase().includes(filterText.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue = a.descripcion.toLowerCase();
      let bValue = b.descripcion.toLowerCase();
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  };

  // Manejar ordenamiento
  const handleSort = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const filteredDiasEntrega = getFilteredAndSortedDiasEntrega();

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-success text-white">
              <div className="row align-items-center">
                <div className="col">
                  <h4 className="mb-0">
                    <i className="bi bi-calendar-week me-2"></i>
                    Gestión de Días de Entrega
                  </h4>
                </div>
                <div className="col-auto">
                  <button 
                    className="btn btn-light"
                    onClick={() => setShowForm(!showForm)}
                    disabled={loading}
                  >
                    {showForm ? 'Cancelar' : 'Agregar Día'}
                  </button>
                  <button 
                    className="btn btn-outline-light ms-2"
                    onClick={loadDiasEntrega}
                    disabled={loading}
                  >
                    {loading ? 'Cargando...' : 'Actualizar'}
                  </button>
                </div>
              </div>
            </div>

            <div className="card-body">
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
                    <h5 className="mb-0">{editingDiaEntrega ? 'Editar Día de Entrega' : 'Nuevo Día de Entrega'}</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      <div className="row">
                        <div className="col-md-8 mb-3">
                          <label htmlFor="descripcion" className="form-label">Descripción *</label>
                          <input
                            type="text"
                            className="form-control"
                            id="descripcion"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleInputChange}
                            placeholder="Ej: Lunes, Martes, etc."
                            required
                          />
                        </div>
                      </div>

                      <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-success" disabled={loading}>
                          {loading ? 'Procesando...' : editingDiaEntrega ? 'Actualizar' : 'Crear'}
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
                    placeholder="Buscar por descripción..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
                </div>
                <div className="col-md-6 text-end">
                  <small className="text-muted">
                    Mostrando {filteredDiasEntrega.length} de {diasEntrega.length} días de entrega
                  </small>
                </div>
              </div>

              {/* Tabla de Días de Entrega */}
              <div className="table-responsive">
                <table className="table table-hover table-striped">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col" className="text-center">ID</th>
                      <th 
                        scope="col" 
                        className="cursor-pointer" 
                        onClick={handleSort}
                        style={{cursor: 'pointer'}}
                      >
                        Descripción {sortDirection === 'asc' ? '↑' : '↓'}
                      </th>
                      <th scope="col" className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDiasEntrega.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center text-muted py-4">
                          {loading ? (
                            <>
                              <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                              Cargando días de entrega...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-calendar-x fs-3 d-block mb-2"></i>
                              {diasEntrega.length === 0 ? 'No hay días de entrega registrados' : 'No se encontraron días de entrega'}
                            </>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredDiasEntrega.map((diaEntrega) => (
                        <tr key={diaEntrega.id}>
                          <td className="text-center">
                            <span className="badge bg-secondary">{diaEntrega.id}</span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <i className="bi bi-calendar-day me-2 text-success"></i>
                              <strong>{diaEntrega.descripcion}</strong>
                            </div>
                          </td>
                          <td className="text-center">
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEdit(diaEntrega)}
                                disabled={loading}
                                title="Editar día de entrega"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(diaEntrega.id, diaEntrega.descripcion)}
                                disabled={loading}
                                title="Eliminar día de entrega"
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

              {/* Información adicional */}
              {filteredDiasEntrega.length > 0 && (
                <div className="mt-3">
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Los días de entrega son utilizados para programar entregas y rutas de distribución.
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiaEntregaList;

'use client';

import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Spinner, Badge, ButtonGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { handleApiError } from '../../lib/api.js';
import { useDiasEntrega, useCreateDiaEntrega, useUpdateDiaEntrega, useDeleteDiaEntrega } from '../../hooks/useDiasEntrega';
import AdvancedDiaEntregaTable from './AdvancedDiaEntregaTable.jsx';

const DiaEntregaList = () => {
  // React Query hooks
  const { 
    data: diasEntregaData = [], 
    isLoading, 
    error: queryError, 
    refetch 
  } = useDiasEntrega();
  
  const createDiaEntregaMutation = useCreateDiaEntrega();
  const updateDiaEntregaMutation = useUpdateDiaEntrega();
  const deleteDiaEntregaMutation = useDeleteDiaEntrega();

  // Procesar datos
  const diasEntrega = diasEntregaData;

  // Estados locales para el formulario y UI
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDiaEntrega, setEditingDiaEntrega] = useState(null);
  
  const [formData, setFormData] = useState({
    descripcion: ''
  });

  const [filterText, setFilterText] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

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
      setError('');
      setSuccess('');
      
      if (editingDiaEntrega) {
        await updateDiaEntregaMutation.mutateAsync({
          ...editingDiaEntrega,
          ...formData
        });
        setSuccess('Día de entrega actualizado exitosamente');
      } else {
        await createDiaEntregaMutation.mutateAsync(formData);
        setSuccess('Día de entrega creado exitosamente');
      }

      resetForm();
    } catch (error) {
      console.error('Error:', error);
      setError(handleApiError(error));
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      descripcion: ''
    });
    setEditingDiaEntrega(null);
    setShowForm(false);
    setError('');
    setSuccess('');
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
      setError('');
      setSuccess('');
      
      await deleteDiaEntregaMutation.mutateAsync(id);
      setSuccess('Día de entrega eliminado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      setError(handleApiError(error));
    }
  };

  // Función para manejar eliminación desde la tabla avanzada
  const handleDeleteClick = (diaEntrega) => {
    handleDelete(diaEntrega.id, diaEntrega.descripcion);
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

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted">Cargando días de entrega...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-white border-bottom-0 py-3">
              <div className="row align-items-center">
                <div className="col">
                  <h4 className="mb-0">
                    <i className="bi bi-calendar-week me-2"></i>
                    Gestión de Días de Entrega
                  </h4>
                </div>
                <div className="col-auto">
                  <Button 
                    variant={showForm ? 'outline-secondary' : 'primary'}
                    onClick={() => setShowForm(!showForm)}
                    disabled={isLoading}
                  >
                    <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'} me-1`}></i>
                    {showForm ? 'Cancelar' : 'Agregar Día'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="card-body">
              {/* Mensajes */}
              {(error || queryError) && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error || queryError?.message || 'Error desconocido'}
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
                        <button 
                          type="submit" 
                          className="btn btn-success" 
                          disabled={createDiaEntregaMutation.isPending || updateDiaEntregaMutation.isPending}
                        >
                          {(createDiaEntregaMutation.isPending || updateDiaEntregaMutation.isPending) ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                              {editingDiaEntrega ? 'Actualizando...' : 'Creando...'}
                            </>
                          ) : (
                            editingDiaEntrega ? 'Actualizar' : 'Crear'
                          )}
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-secondary" 
                          onClick={resetForm}
                          disabled={createDiaEntregaMutation.isPending || updateDiaEntregaMutation.isPending}
                        >
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
              <AdvancedDiaEntregaTable 
                data={filteredDiasEntrega}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                isLoading={updateDiaEntregaMutation.isPending || deleteDiaEntregaMutation.isPending}
                deletingId={deleteDiaEntregaMutation.isPending ? deleteDiaEntregaMutation.variables : null}
              />

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

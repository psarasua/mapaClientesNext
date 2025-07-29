'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Button, Form, Alert, Spinner } from 'react-bootstrap';
import { handleApiError } from '../../lib/api.js';
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '../../hooks/useClients';
import LocationPickerMap from './LocationPickerMap.jsx';
import AdvancedClientTable from './AdvancedClientTable.jsx';

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
    setError('');
    setSuccess('');

    try {
      if (editingClient) {
        await updateClientMutation.mutateAsync({
          id: editingClient.id,
          ...formData
        });
        setSuccess('Cliente actualizado exitosamente');
      } else {
        await createClientMutation.mutateAsync(formData);
        setSuccess('Cliente creado exitosamente');
      }
      
      resetForm();
      refetch();
    } catch (error) {
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
    setError('');
    setSuccess('');
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
    setError('');
    setSuccess('');
  }, []);

  // Eliminar cliente - Optimizado con useCallback
  const handleDelete = useCallback(async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar al cliente "${nombre}"?`)) {
      return;
    }

    try {
      await deleteClientMutation.mutateAsync(id);
      setSuccess('Cliente eliminado exitosamente');
      refetch();
    } catch (error) {
      setError(handleApiError(error));
    }
  }, [deleteClientMutation]);

  const handleLocationChange = (coordinates) => {
    setFormData(prev => ({
      ...prev,
      Coordenada_y: coordinates.latitude,
      Coordenada_x: coordinates.longitude
    }));
  };

  // Mostrar loading inicial
  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted">Cargando clientes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100vw', 
      minWidth: '100vw',
      maxWidth: 'none', 
      margin: 0, 
      padding: '1rem 2rem',
      boxSizing: 'border-box',
      position: 'relative',
      left: '50%',
      transform: 'translateX(-50%)'
    }}>
      {/* Header sin card - diseño plano ocupando todo el ancho */}
      <div className="mb-4" style={{ width: '100%' }}>
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">
            <i className="bi bi-people-fill me-2"></i>
            Gestión de Clientes
          </h4>
          <Button 
            variant={showForm ? 'outline-secondary' : 'primary'}
            onClick={() => setShowForm(!showForm)}
            disabled={isLoading || createClientMutation.isPending || updateClientMutation.isPending}
          >
            <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'} me-1`}></i>
            {showForm ? 'Cancelar' : 'Agregar Cliente'}
          </Button>
        </div>
      </div>

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
        <div className="mb-4">
          <div className="border rounded p-4 bg-light">
            <h5 className="mb-3">
              <i className="bi bi-person-plus me-2"></i>
              {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h5>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="Codigo" className="form-label">Código</label>
                  <input
                    type="text"
                    className="form-control"
                    id="Codigo"
                    name="Codigo"
                    value={formData.Codigo}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="Nombre" className="form-label">Nombre</label>
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
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
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
                <div className="col-md-6 mb-3">
                  <label htmlFor="Direccion" className="form-label">Dirección</label>
                  <input
                    type="text"
                    className="form-control"
                    id="Direccion"
                    name="Direccion"
                    value={formData.Direccion}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
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
                <div className="col-md-6 mb-3">
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
                <div className="col-md-6 mb-3">
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

      {/* Tabla Avanzada con TanStack Table */}
      <AdvancedClientTable
        clients={clients || []}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        createMutationPending={createClientMutation.isPending}
        updateMutationPending={updateClientMutation.isPending}
        deleteMutationPending={deleteClientMutation.isPending}
      />
    </div>
  );
};

export default ClientList;

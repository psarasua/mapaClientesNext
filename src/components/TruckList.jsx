'use client';

import { useState, useEffect } from 'react';
import { truckApi, handleApiError } from '../lib/api';
import { validateCreateTruckData } from '../types';

export default function TruckList() {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [truckToDelete, setTruckToDelete] = useState(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    description: ''
  });

  // Cargar camiones al montar el componente
  useEffect(() => {
    loadTrucks();
  }, []);

  const loadTrucks = async () => {
    try {
      setLoading(true);
      const response = await truckApi.getAll();
      setTrucks(response.trucks);
      setError(null);
    } catch (err) {
      console.error('Error cargando camiones:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar datos del formulario
    if (!validateCreateTruckData(formData)) {
      setError('Por favor, complete todos los campos obligatorios correctamente');
      return;
    }

    try {
      if (editingTruck) {
        // Actualizar camión existente
        await truckApi.update({ ...formData, id: editingTruck.id });
      } else {
        // Crear nuevo camión
        await truckApi.create(formData);
      }
      
      // Recargar la lista y resetear el formulario
      await loadTrucks();
      resetForm();
      
      // Mostrar mensaje de éxito
      console.log(`Camión ${editingTruck ? 'actualizado' : 'creado'} exitosamente`);
      
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleEdit = (truck) => {
    setEditingTruck(truck);
    setFormData({
      description: truck.description
    });
    setShowForm(true);
  };

  const handleDeleteClick = (truck) => {
    setTruckToDelete(truck);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!truckToDelete) return;
    
    try {
      await truckApi.delete(truckToDelete.id);
      await loadTrucks();
      setShowDeleteModal(false);
      setTruckToDelete(null);
      console.log('Camión eliminado exitosamente');
    } catch (err) {
      setError(handleApiError(err));
      setShowDeleteModal(false);
    }
  };

  const resetForm = () => {
    setFormData({ 
      description: ''
    });
    setEditingTruck(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Cargando camiones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom-0 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-0">
                <i className="bi bi-truck me-2"></i>
                Gestión de Camiones
              </h4>
              <small className="text-muted">{trucks.length} camión(es) registrado(s)</small>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className={`btn ${showForm ? 'btn-outline-secondary' : 'btn-primary'}`}
            >
              <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'} me-1`}></i>
              {showForm ? 'Cancelar' : 'Nuevo Camión'}
            </button>
          </div>
        </div>

        <div className="card-body">
          {error && (
            <div className="alert alert-warning alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setError(null)}
                aria-label="Close"
              ></button>
            </div>
          )}

          {/* Formulario */}
          {showForm && (
            <div className="card mb-4 border-primary">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className={`bi ${editingTruck ? 'bi-pencil-square' : 'bi-truck-plus'} me-2`}></i>
                  {editingTruck ? 'Editar Camión' : 'Nuevo Camión'}
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-12 mb-3">
                      <label className="form-label">
                        Descripción <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        rows="3"
                        placeholder="Descripción detallada del camión"
                      />
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success">
                      <i className={`bi ${editingTruck ? 'bi-check-lg' : 'bi-plus-lg'} me-1`}></i>
                      {editingTruck ? 'Actualizar' : 'Crear'}
                    </button>
                    <button type="button" onClick={resetForm} className="btn btn-secondary">
                      <i className="bi bi-x-lg me-1"></i>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Tabla de camiones */}
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th scope="col" width="10%">ID</th>
                  <th scope="col" width="70%">Descripción</th>
                  <th scope="col" width="20%">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {trucks.map((truck) => (
                  <tr key={truck.id}>
                    <td>
                      <span className="badge bg-primary">{truck.id}</span>
                    </td>
                    <td className="fw-medium">
                      <div title={truck.description}>
                        {truck.description}
                      </div>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm" role="group">
                        <button
                          onClick={() => handleEdit(truck)}
                          className="btn btn-outline-primary"
                          title="Editar camión"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(truck)}
                          className="btn btn-outline-danger"
                          title="Eliminar camión"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {trucks.length === 0 && (
              <div className="text-center py-5">
                <div className="text-muted">
                  <i className="bi bi-truck display-1 mb-3"></i>
                  <h5>No hay camiones registrados</h5>
                  <p>Haz clic en &quot;Nuevo Camión&quot; para agregar el primero.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-exclamation-triangle text-warning me-2"></i>
                  Confirmar eliminación
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que quieres eliminar el camión:</p>
                <div className="bg-light p-3 rounded">
                  <strong>{truckToDelete?.description}</strong>
                  {truckToDelete?.license_plate && (
                    <div><small className="text-muted">Placa: {truckToDelete.license_plate}</small></div>
                  )}
                </div>
                <p className="text-muted small mt-2">Esta acción no se puede deshacer.</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={confirmDelete}
                >
                  <i className="bi bi-trash me-1"></i>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

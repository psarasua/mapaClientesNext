'use client';

import { useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { handleApiError } from '../../lib/api';
import { validateCreateTruckData } from '../../types';
import { useTrucks, useCreateTruck, useUpdateTruck, useDeleteTruck } from '../../hooks/useTrucks';
import AdvancedTruckTable from './AdvancedTruckTable.jsx';

export default function TruckList() {
  // React Query hooks
  const { 
    data: trucksData = [], 
    isLoading, 
    error: queryError, 
    refetch 
  } = useTrucks();
  
  const createTruckMutation = useCreateTruck();
  const updateTruckMutation = useUpdateTruck();
  const deleteTruckMutation = useDeleteTruck();

  // Procesar y ordenar los datos, filtrar duplicados y validar IDs
  const trucks = trucksData
    .filter((truck, index, array) => 
      truck && 
      truck.id && 
      array.findIndex(t => t.id === truck.id) === index
    )
    .sort((a, b) => (a.id || 0) - (b.id || 0));

  // Estados locales para el formulario y UI
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [truckToDelete, setTruckToDelete] = useState(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    description: ''
  });

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
        await updateTruckMutation.mutateAsync({
          ...editingTruck,
          ...formData
        });
      } else {
        // Crear nuevo camión
        await createTruckMutation.mutateAsync(formData);
      }
      
      resetForm();
      
      // Mostrar mensaje de éxito
              // Camión actualizado/creado exitosamente
      
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
      await deleteTruckMutation.mutateAsync(truckToDelete.id);
      setShowDeleteModal(false);
      setTruckToDelete(null);
    } catch (err) {
      setError(`Error eliminando camión: ${handleApiError(err)}`);
      setShowDeleteModal(false);
    }
  };

  const resetForm = () => {
    setFormData({ 
      description: ''
    });
    setEditingTruck(null);
    setShowForm(false);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted">Cargando camiones...</p>
        </div>
      </div>
    );
  }

  return (
    <Container fluid>
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom-0 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-0">
                <i className="bi bi-truck me-2"></i>
                Gestión de Camiones
              </h4>
              <small className="text-muted">{trucks.length} camión(es) registrado(s)</small>
            </div>
            <div>
              <Button
                onClick={() => setShowForm(!showForm)}
                variant={showForm ? 'outline-secondary' : 'primary'}
              >
                <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'} me-1`}></i>
                {showForm ? 'Cancelar' : 'Nuevo Camión'}
              </Button>
            </div>
          </div>
        </Card.Header>

        <Card.Body>
          {(error || queryError) && (
            <Alert 
              variant="warning" 
              dismissible 
              onClose={() => setError(null)}
              className="fade show"
            >
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error || queryError?.message || 'Error desconocido'}
            </Alert>
          )}

          {/* Formulario */}
          {showForm && (
            <Card className="mb-4 border-primary">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <i className={`bi ${editingTruck ? 'bi-pencil-square' : 'bi-truck-plus'} me-2`}></i>
                  {editingTruck ? 'Editar Camión' : 'Nuevo Camión'}
                </h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col xs={12} className="mb-3">
                      <Form.Group>
                        <Form.Label>
                          Descripción <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          required
                          rows={3}
                          placeholder="Descripción detallada del camión"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-flex gap-2">
                    <Button 
                      type="submit" 
                      variant="success"
                      disabled={createTruckMutation.isPending || updateTruckMutation.isPending}
                    >
                      {(createTruckMutation.isPending || updateTruckMutation.isPending) ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-1" />
                          {editingTruck ? 'Actualizando...' : 'Creando...'}
                        </>
                      ) : (
                        <>
                          <i className={`bi ${editingTruck ? 'bi-check-lg' : 'bi-plus-lg'} me-1`}></i>
                          {editingTruck ? 'Actualizar' : 'Crear'}
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      onClick={resetForm} 
                      variant="secondary"
                      disabled={createTruckMutation.isPending || updateTruckMutation.isPending}
                    >
                      <i className="bi bi-x-lg me-1"></i>
                      Cancelar
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}

          {/* Tabla de camiones */}
          <div className="table-responsive">
            <AdvancedTruckTable 
              data={trucks}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              isLoading={updateTruckMutation.isPending || deleteTruckMutation.isPending}
              deletingId={deleteTruckMutation.isPending ? deleteTruckMutation.variables : null}
            />
          </div>
        </Card.Body>
      </Card>

      {/* Modal de confirmación para eliminar */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-exclamation-triangle text-warning me-2"></i>
            Confirmar eliminación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que quieres eliminar el camión:</p>
          <div className="bg-light p-3 rounded">
            <strong>{truckToDelete?.description}</strong>
            {truckToDelete?.license_plate && (
              <div><small className="text-muted">Placa: {truckToDelete.license_plate}</small></div>
            )}
          </div>
          <p className="text-muted small mt-2">Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleteTruckMutation.isPending}
          >
            Cancelar
          </Button>
          <Button 
            variant="danger"
            onClick={confirmDelete}
            disabled={deleteTruckMutation.isPending}
          >
            {deleteTruckMutation.isPending ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                Eliminando...
              </>
            ) : (
              <>
                <i className="bi bi-trash me-1"></i>
                Eliminar
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

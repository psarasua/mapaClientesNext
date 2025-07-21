'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Spinner, Badge, ButtonGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { truckApi, handleApiError } from '../../lib/api';
import { validateCreateTruckData } from '../../types';

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
      
      // truckApi.getAll() devuelve el objeto completo con { success, trucks, total, source }
      if (response && response.trucks) {
        setTrucks(response.trucks);
      } else {
        setTrucks(Array.isArray(response) ? response : []);
      }
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
            <Button
              onClick={() => setShowForm(!showForm)}
              variant={showForm ? 'outline-secondary' : 'primary'}
            >
              <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'} me-1`}></i>
              {showForm ? 'Cancelar' : 'Nuevo Camión'}
            </Button>
          </div>
        </Card.Header>

        <Card.Body>
          {error && (
            <Alert 
              variant="warning" 
              dismissible 
              onClose={() => setError(null)}
              className="fade show"
            >
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
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
                    <Button type="submit" variant="success">
                      <i className={`bi ${editingTruck ? 'bi-check-lg' : 'bi-plus-lg'} me-1`}></i>
                      {editingTruck ? 'Actualizar' : 'Crear'}
                    </Button>
                    <Button type="button" onClick={resetForm} variant="secondary">
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
            <Table hover className="align-middle">
              <thead className="table-light">
                <tr>
                  <th width="10%">ID</th>
                  <th width="70%">Descripción</th>
                  <th width="20%">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {trucks.map((truck) => (
                  <tr key={truck.id}>
                    <td>
                      <Badge bg="primary">{truck.id}</Badge>
                    </td>
                    <td className="fw-medium">
                      <div title={truck.description}>
                        {truck.description}
                      </div>
                    </td>
                    <td>
                      <ButtonGroup size="sm">
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Editar camión</Tooltip>}
                        >
                          <Button
                            onClick={() => handleEdit(truck)}
                            variant="outline-primary"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Eliminar camión</Tooltip>}
                        >
                          <Button
                            onClick={() => handleDeleteClick(truck)}
                            variant="outline-danger"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </OverlayTrigger>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            
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
          >
            Cancelar
          </Button>
          <Button 
            variant="danger"
            onClick={confirmDelete}
          >
            <i className="bi bi-trash me-1"></i>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

'use client';

import { useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { handleApiError, localStorageApi } from '../../lib/api';
import { validateCreateUserData } from '../../types';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../../hooks/useUsers';
import AdvancedUserTable from './AdvancedUserTable.jsx';

export default function UserList() {
  // React Query hooks
  const { 
    data: usersData = [], 
    isLoading, 
    error: queryError, 
    refetch 
  } = useUsers();
  
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  // Procesar y filtrar datos únicos
  const processedUsers = (usersData || [])
    .filter((user, index, array) => 
      user && 
      user.id && 
      array.findIndex(u => u.id === user.id) === index
    )
    .sort((a, b) => (a.id || 0) - (b.id || 0));

  // Estados locales para el formulario y UI
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    usuario: '',
    password: ''
  });

  // Combinar errores de React Query con errores locales
  const combinedError = queryError || error;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar datos del formulario
    if (!validateCreateUserData(formData)) {
      setError('Por favor, complete todos los campos obligatorios correctamente');
      return;
    }

    try {
      setError(null); // Limpiar errores previos
      
      if (editingUser) {
        // Actualizar usuario existente
        await updateUserMutation.mutateAsync({ ...formData, id: editingUser.id });
      } else {
        // Crear nuevo usuario
        await createUserMutation.mutateAsync(formData);
      }
      
      // Resetear el formulario después del éxito
      resetForm();
      
      // Mostrar mensaje de éxito (podrías usar un toast aquí)
      console.log(`Usuario ${editingUser ? 'actualizado' : 'creado'} exitosamente`);
      
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      usuario: user.usuario || '',
      password: user.password || ''
    });
    setShowForm(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      setError(null); // Limpiar errores previos
      await deleteUserMutation.mutateAsync(userToDelete.id);
      setShowDeleteModal(false);
      setUserToDelete(null);
      console.log('Usuario eliminado exitosamente');
    } catch (err) {
      setError(handleApiError(err));
      setShowDeleteModal(false);
    }
  };

  const resetForm = () => {
    setFormData({ 
      usuario: '', 
      password: ''
    });
    setEditingUser(null);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted">Cargando usuarios...</p>
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
                <i className="bi bi-people-fill me-2"></i>
                Gestión de Usuarios
              </h4>
              <small className="text-muted">{processedUsers.length} usuario(s) registrado(s)</small>
            </div>
            <div>
              <Button
                onClick={() => setShowForm(!showForm)}
                variant={showForm ? 'outline-secondary' : 'primary'}
              >
                <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'} me-1`}></i>
                {showForm ? 'Cancelar' : 'Nuevo Usuario'}
              </Button>
            </div>
          </div>
        </Card.Header>

        <Card.Body>
          {combinedError && (
            <Alert 
              variant="warning" 
              dismissible 
              onClose={() => setError(null)}
              className="fade show"
            >
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {typeof combinedError === 'string' ? combinedError : handleApiError(combinedError)}
            </Alert>
          )}

          {/* Formulario */}
          {showForm && (
            <Card className="mb-4 border-primary">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <i className={`bi ${editingUser ? 'bi-pencil-square' : 'bi-person-plus'} me-2`}></i>
                  {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>
                          Usuario <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.usuario || ''}
                          onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                          required
                          placeholder="Ingrese el nombre de usuario"
                          minLength={3}
                        />
                        <Form.Text className="text-muted">
                          Mínimo 3 caracteres
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>
                          Contraseña <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="password"
                          value={formData.password || ''}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                          placeholder="Ingrese la contraseña"
                          minLength={6}
                        />
                        <Form.Text className="text-muted">
                          Mínimo 6 caracteres
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-flex gap-2 mt-3">
                    <Button 
                      type="submit" 
                      variant="success"
                      disabled={createUserMutation.isPending || updateUserMutation.isPending}
                    >
                      {(createUserMutation.isPending || updateUserMutation.isPending) ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-1" />
                          {editingUser ? 'Actualizando...' : 'Creando...'}
                        </>
                      ) : (
                        <>
                          <i className={`bi ${editingUser ? 'bi-check-lg' : 'bi-plus-lg'} me-1`}></i>
                          {editingUser ? 'Actualizar' : 'Crear'}
                        </>
                      )}
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

          {/* Tabla avanzada de usuarios */}
          <AdvancedUserTable
            users={processedUsers || []}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            isLoading={isLoading}
            createMutationPending={createUserMutation.isPending}
            updateMutationPending={updateUserMutation.isPending}
            deleteMutationPending={deleteUserMutation.isPending}
          />

      {/* Modal de confirmación para eliminar */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-exclamation-triangle text-warning me-2"></i>
            Confirmar eliminación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que quieres eliminar al usuario <strong>{userToDelete?.usuario}</strong>?</p>
          <p className="text-muted small">Esta acción no se puede deshacer.</p>
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
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ? (
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
        </Card.Body>
      </Card>
    </Container>
  );
}

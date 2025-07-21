'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Spinner, Badge, ButtonGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { userApi, handleApiError, localStorageApi } from '../../lib/api';
import { validateCreateUserData } from '../../types';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: 0,
    phone: '',
    role: 'user'
  });

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getAll();
      setUsers(response.users);
      setError(null);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      
      // Intentar cargar desde localStorage como fallback
      try {
        const localUsers = localStorageApi.getUsers();
        if (localUsers.length > 0) {
          setUsers(localUsers);
          setError('Usando datos guardados localmente (sin conexión al servidor)');
        } else {
          setError(handleApiError(err));
        }
      } catch (localErr) {
        setError(handleApiError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar datos del formulario
    if (!validateCreateUserData(formData)) {
      setError('Por favor, complete todos los campos obligatorios correctamente');
      return;
    }

    try {
      if (editingUser) {
        // Actualizar usuario existente
        await userApi.update({ ...formData, id: editingUser.id });
      } else {
        // Crear nuevo usuario
        await userApi.create(formData);
      }
      
      // Recargar la lista y resetear el formulario
      await loadUsers();
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
      name: user.name,
      email: user.email,
      age: user.age,
      phone: user.phone || '',
      role: user.role || 'user'
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
      await userApi.delete(userToDelete.id);
      await loadUsers();
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
      name: '', 
      email: '', 
      age: 0, 
      phone: '', 
      role: 'user' 
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const getRoleBadge = (role) => {
    const variants = {
      admin: 'danger',
      moderator: 'warning',
      user: 'primary'
    };
    return variants[role] || 'secondary';
  };

  if (loading) {
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
              <small className="text-muted">{users.length} usuario(s) registrado(s)</small>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              variant={showForm ? 'outline-secondary' : 'primary'}
            >
              <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'} me-1`}></i>
              {showForm ? 'Cancelar' : 'Nuevo Usuario'}
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
                          Nombre <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          placeholder="Ingrese el nombre completo"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>
                          Email <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          placeholder="usuario@example.com"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={4} className="mb-3">
                      <Form.Group>
                        <Form.Label>
                          Edad <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                          min="1"
                          max="120"
                          required
                          placeholder="25"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4} className="mb-3">
                      <Form.Group>
                        <Form.Label>Teléfono</Form.Label>
                        <Form.Control
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+34 666 123 456"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4} className="mb-3">
                      <Form.Group>
                        <Form.Label>Rol</Form.Label>
                        <Form.Select
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                          <option value="user">Usuario</option>
                          <option value="moderator">Moderador</option>
                          <option value="admin">Administrador</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-flex gap-2">
                    <Button type="submit" variant="success">
                      <i className={`bi ${editingUser ? 'bi-check-lg' : 'bi-plus-lg'} me-1`}></i>
                      {editingUser ? 'Actualizar' : 'Crear'}
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

          {/* Tabla de usuarios */}
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Edad</th>
                  <th>Teléfono</th>
                  <th>Rol</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <Badge bg="light" text="dark">{user.id}</Badge>
                    </td>
                    <td className="fw-medium">{user.name}</td>
                    <td>
                      <a href={`mailto:${user.email}`} className="text-decoration-none">
                        {user.email}
                      </a>
                    </td>
                    <td>{user.age} años</td>
                    <td>
                      {user.phone ? (
                        <a href={`tel:${user.phone}`} className="text-decoration-none">
                          {user.phone}
                        </a>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <Badge bg={getRoleBadge(user.role)}>
                        {user.role}
                      </Badge>
                    </td>
                    <td>
                      <ButtonGroup size="sm">
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Editar usuario</Tooltip>}
                        >
                          <Button
                            onClick={() => handleEdit(user)}
                            variant="outline-primary"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Eliminar usuario</Tooltip>}
                        >
                          <Button
                            onClick={() => handleDeleteClick(user)}
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
            
            {users.length === 0 && (
              <div className="text-center py-5">
                <div className="text-muted">
                  <i className="bi bi-person-x display-1 mb-3"></i>
                  <h5>No hay usuarios registrados</h5>
                  <p>Haz clic en "Nuevo Usuario" para agregar el primero.</p>
                </div>
              </div>
            )}
          </div>

      {/* Modal de confirmación para eliminar */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-exclamation-triangle text-warning me-2"></i>
            Confirmar eliminación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que quieres eliminar al usuario <strong>{userToDelete?.name}</strong>?</p>
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
          >
            <i className="bi bi-trash me-1"></i>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
        </Card.Body>
      </Card>
    </Container>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { userApi, handleApiError, localStorageApi } from '../lib/api';
import { validateCreateUserData } from '../types';

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
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Cargando usuarios...</p>
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
                <i className="bi bi-people-fill me-2"></i>
                Gestión de Usuarios
              </h4>
              <small className="text-muted">{users.length} usuario(s) registrado(s)</small>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className={`btn ${showForm ? 'btn-outline-secondary' : 'btn-primary'}`}
            >
              <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'} me-1`}></i>
              {showForm ? 'Cancelar' : 'Nuevo Usuario'}
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
                  <i className={`bi ${editingUser ? 'bi-pencil-square' : 'bi-person-plus'} me-2`}></i>
                  {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Nombre <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Ingrese el nombre completo"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="usuario@example.com"
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">
                        Edad <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                        min="1"
                        max="120"
                        required
                        placeholder="25"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Teléfono</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+34 666 123 456"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Rol</label>
                      <select
                        className="form-select"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      >
                        <option value="user">Usuario</option>
                        <option value="moderator">Moderador</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success">
                      <i className={`bi ${editingUser ? 'bi-check-lg' : 'bi-plus-lg'} me-1`}></i>
                      {editingUser ? 'Actualizar' : 'Crear'}
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

          {/* Tabla de usuarios */}
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Nombre</th>
                  <th scope="col">Email</th>
                  <th scope="col">Edad</th>
                  <th scope="col">Teléfono</th>
                  <th scope="col">Rol</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <span className="badge bg-light text-dark">{user.id}</span>
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
                      <span className={`badge bg-${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm" role="group">
                        <button
                          onClick={() => handleEdit(user)}
                          className="btn btn-outline-primary"
                          title="Editar usuario"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="btn btn-outline-danger"
                          title="Eliminar usuario"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
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
                <p>¿Estás seguro de que quieres eliminar al usuario <strong>{userToDelete?.name}</strong>?</p>
                <p className="text-muted small">Esta acción no se puede deshacer.</p>
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

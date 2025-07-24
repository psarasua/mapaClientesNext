'use client';

import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    usuario: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Usar la URL correcta detectando automáticamente el puerto
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        // Guardar token en localStorage
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Redirigir al dashboard
        window.location.href = '/';
      } else {
        setError(result.error || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error en login:', error);
      setError('Error de conexión. Verifica que el servidor esté funcionando.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex">
      {/* Panel izquierdo - Información */}
      <div className="col-md-6 col-lg-7 d-none d-md-flex flex-column justify-content-center align-items-center login-left-panel text-white p-5">
        <div className="text-center" style={{ maxWidth: '500px', zIndex: 1 }}>
          <div className="mb-5">
            <div className="mb-4 login-feature-icon">
              <h1 className="display-3 fw-bold mb-3">🚛</h1>
            </div>
            <h1 className="display-5 fw-bold mb-3">Sistema de Repartos</h1>
          
          </div>
          
          <div className="row g-4 mb-5">
            <div className="col-6">
              <div className="text-center login-feature-icon">
                <div className="bg-white bg-opacity-20 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                  <span style={{ fontSize: '24px' }}>🗺️</span>
                </div>
                <h6 className="fw-semibold">Mapas Interactivos</h6>
                
              </div>
            </div>
            <div className="col-6">
              <div className="text-center login-feature-icon">
                <div className="bg-white bg-opacity-20 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                  <span style={{ fontSize: '24px' }}>📊</span>
                </div>
                <h6 className="fw-semibold">Dashboard Analytics</h6>
               
              </div>
            </div>
            <div className="col-6">
              <div className="text-center login-feature-icon">
                <div className="bg-white bg-opacity-20 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                  <span style={{ fontSize: '24px' }}>🚚</span>
                </div>
                <h6 className="fw-semibold">Gestión de Flotas</h6>
                
              </div>
            </div>
            <div className="col-6">
              <div className="text-center login-feature-icon">
                <div className="bg-white bg-opacity-20 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                  <span style={{ fontSize: '24px' }}>👥</span>
                </div>
                <h6 className="fw-semibold">Control de Clientes</h6>
                
              </div>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-4 p-4 border border-white border-opacity-20">
            <small className="opacity-75">
              <strong>Tecnología:</strong> Next.js • React Bootstrap • Leaflet Maps • SQLite/Turso
            </small>
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario de login */}
      <div className="col-md-6 col-lg-5 d-flex flex-column justify-content-center login-right-panel p-4 p-md-5">
        <div className="login-form-container">
          {/* Header móvil */}
          <div className="text-center mb-4 d-md-none">
            <h2 className="fw-bold text-white mb-2">🚛 Sistema de Repartos</h2>
            <p className="text-white-50">Gestión de entregas y logística</p>
          </div>

          {/* Header desktop */}
          <div className="text-center mb-5 d-none d-md-block">
            <h2 className="fw-bold text-dark mb-2">Bienvenido de vuelta</h2>
            <p className="text-muted">Ingresa tus credenciales para continuar</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" className="mb-4 border-0 shadow-sm">
              <div className="d-flex align-items-center">
                <span className="me-2">⚠️</span>
                <span>{error}</span>
              </div>
            </Alert>
          )}

          {/* Login Form */}
          <Form onSubmit={handleSubmit} className="login-form">
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold text-dark mb-2">
                <FaUser className="me-2 text-primary" />
                Usuario
              </Form.Label>
              <Form.Control
                type="text"
                name="usuario"
                value={formData.usuario}
                onChange={handleChange}
                placeholder="Ingresa tu usuario"
                required
                disabled={loading}
                className="py-3"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold text-dark mb-2">
                <FaLock className="me-2 text-primary" />
                Contraseña
              </Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña"
                  required
                  disabled={loading}
                  className="py-3 pe-5"
                />
                <Button
                  variant="link"
                  className="position-absolute end-0 top-50 translate-middle-y border-0 text-muted p-2"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  style={{ marginRight: '12px' }}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </Button>
              </div>
            </Form.Group>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-100 py-3 mb-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, Badge, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { healthApi, handleApiError } from '../../lib/api';

export default function ApiStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkApiHealth();
    // Verificar cada 30 segundos
    const interval = setInterval(checkApiHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkApiHealth = async () => {
    try {
      setLoading(true);
      const healthStatus = await healthApi.check();
      setStatus(healthStatus);
      setError(null);
    } catch (err) {
      setError(handleApiError(err));
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = () => {
    if (error) return 'danger';
    if (status?.status === 'ok') return 'success';
    return 'warning';
  };

  const getStatusText = () => {
    if (error) return 'Error';
    if (status?.status === 'ok') return 'Activa';
    return 'Desconocido';
  };

  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="mb-0">
            <i className="bi bi-activity me-2"></i>
            Estado de la API
          </Card.Title>
          <Button
            onClick={checkApiHealth}
            variant="outline-primary"
            size="sm"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner
                  animation="border"
                  size="sm"
                  className="me-2"
                  role="status"
                  aria-hidden="true"
                />
                Verificando...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-clockwise me-1"></i>
                Actualizar
              </>
            )}
          </Button>
        </div>

        <Row>
          <Col md={6}>
            <div className="d-flex align-items-center mb-2">
              <Badge bg={getStatusVariant()} className="me-2">
                {getStatusText()}
              </Badge>
              <small className="text-muted">Estado del servidor</small>
            </div>
            
            {status && (
              <>
                <div className="mb-2">
                  <small className="text-muted d-block">Versión:</small>
                  <span className="fw-medium">{status.version}</span>
                </div>
                <div className="mb-2">
                  <small className="text-muted d-block">Entorno:</small>
                  <span className="fw-medium">{status.environment}</span>
                </div>
                <div className="mb-2">
                  <small className="text-muted d-block">Última verificación:</small>
                  <span className="fw-medium">
                    {new Date(status.timestamp).toLocaleString('es-ES')}
                  </span>
                </div>
              </>
            )}
          </Col>
          
          <Col md={6}>
            {status?.database && (
              <div className="mb-3">
                <h6 className="fw-bold">Base de Datos</h6>
                <div className="d-flex align-items-center mb-1">
                  <Badge 
                    bg={status.database.status === 'ok' ? 'success' : 'warning'} 
                    className="me-2"
                  >
                    {status.database.status === 'ok' ? 'Conectada' : 'Fallback'}
                  </Badge>
                  <small className="text-muted">{status.database.type}</small>
                </div>
                <small className="text-muted">{status.database.message}</small>
              </div>
            )}
            
            {status?.features && (
              <div>
                <h6 className="fw-bold">Características</h6>
                <ul className="list-unstyled small text-muted">
                  {status.features.map((feature, index) => (
                    <li key={index}>
                      <i className="bi bi-check-circle-fill text-success me-1"></i>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" className="mt-3 mb-0">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>Error:</strong> {error}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
}

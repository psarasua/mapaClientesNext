'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ProgressBar, Table, Badge, Spinner } from 'react-bootstrap';
import { FaUpload, FaFileExcel, FaDownload, FaInfoCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import * as XLSX from 'xlsx';

export default function ImportPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  // Redirigir si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const [file, setFile] = useState(null);
  const [tableType, setTableType] = useState('');
  const [replaceData, setReplaceData] = useState(false); // true = reemplazar, false = agregar
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const tableOptions = [
    { 
      value: 'clients', 
      label: 'Clientes', 
      icon: '👥',
      description: 'Importar información de clientes con direcciones y coordenadas',
      columns: [
        { name: 'Codigo', required: true, type: 'text', description: 'Código único del cliente (ej: CLI001)', example: 'CLI001' },
        { name: 'Razon', required: true, type: 'text', description: 'Razón social completa', example: 'Distribuidora Norte S.A.' },
        { name: 'Nombre', required: true, type: 'text', description: 'Nombre comercial del cliente', example: 'Supermercado Norte' },
        { name: 'Direccion', required: true, type: 'text', description: 'Dirección física completa', example: 'Av. Italia 2354, Montevideo' },
        { name: 'Telefono1', required: false, type: 'text', description: 'Número de teléfono principal', example: '099123456' },
        { name: 'Ruc', required: false, type: 'text', description: 'RUC o documento fiscal', example: '212345670018' },
        { name: 'Activo', required: false, type: 'boolean', description: 'Estado activo (1=Activo, 0=Inactivo)', example: '1' },
        { name: 'Coordenada_x', required: false, type: 'number', description: 'Longitud de la ubicación (decimal)', example: '-56.1645' },
        { name: 'Coordenada_y', required: false, type: 'number', description: 'Latitud de la ubicación (decimal)', example: '-34.9011' }
      ]
    },
    { 
      value: 'trucks', 
      label: 'Camiones', 
      icon: '🚛',
      description: 'Importar información de la flota de camiones',
      columns: [
        { name: 'descripcion', required: true, type: 'text', description: 'Descripción del camión o identificador', example: 'Camión Reparto Norte - Placa ABC123' }
      ]
    },
    { 
      value: 'repartos', 
      label: 'Repartos', 
      icon: '📦',
      description: 'Importar zonas y rutas de reparto',
      columns: [
        { name: 'nombre', required: true, type: 'text', description: 'Nombre de la zona de reparto', example: 'Zona Norte' },
        { name: 'descripcion', required: false, type: 'text', description: 'Descripción detallada de la zona', example: 'Zona norte de la ciudad, incluye barrios X, Y, Z' },
        { name: 'color', required: false, type: 'text', description: 'Color para identificar en mapas (formato hex)', example: '#FF5733' }
      ]
    }
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
          selectedFile.type !== 'application/vnd.ms-excel') {
        setError('Por favor selecciona un archivo Excel válido (.xlsx o .xls)');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
      setResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }
    
    if (!tableType) {
      setError('Por favor selecciona el tipo de datos a importar');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tableType', tableType);
      formData.append('replaceData', replaceData.toString());

      const response = await fetch('/api/import-excel', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        setFile(null);
        setTableType('');
        // Reset form
        document.getElementById('fileInput').value = '';
      } else {
        setError(data.error || 'Error al procesar el archivo');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = (type) => {
    const templates = {
      clients: [
        ['codigo', 'razonSocial', 'direccion', 'telefono', 'email', 'lat', 'lng', 'observaciones'],
        ['CLI001', 'Distribuidora Norte S.A.', 'Av. Italia 2354, Montevideo', '099123456', 'contacto@norte.com', -34.8949, -56.1670, 'Cliente VIP'],
        ['CLI002', 'Super Express Ltda.', '18 de Julio 1234', '098765432', 'ventas@express.com', -34.9011, -56.1645, 'Entrega rápida']
      ],
      trucks: [
        ['descripcion'],
        ['Camión Reparto Norte - Placa ABC123'],
        ['Camión Reparto Sur - Placa DEF456'],
        ['Camión Centro - Placa GHI789']
      ],
      repartos: [
        ['nombre', 'descripcion', 'color'],
        ['Zona Norte', 'Reparto zona norte de la ciudad, incluye barrios Pocitos, Punta Carretas', '#FF5733'],
        ['Zona Sur', 'Reparto zona sur de la ciudad, incluye barrios Malvín, Buceo', '#33FF57'],
        ['Zona Centro', 'Reparto zona centro de la ciudad, incluye Ciudad Vieja, Centro', '#3357FF']
      ]
    };

    const ws = XLSX.utils.aoa_to_sheet(templates[type]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
    XLSX.writeFile(wb, `plantilla_${type}.xlsx`);
  };

  // Mostrar spinner mientras se verifica la autenticación
  if (authLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Verificando autenticación...</p>
        </div>
      </Container>
    );
  }

  // Si no está autenticado, no mostrar nada (se redirige en useEffect)
  if (!user) {
    return null;
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h2 className="mb-4">
            <FaFileExcel className="me-2" />
            Importación de Datos desde Excel
          </h2>
          
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <FaUpload className="me-2" />
                Subir Archivo Excel
              </h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              {result && (
                <Alert variant="success">
                  <h6>✅ Importación Exitosa</h6>
                  <p className="mb-1">
                    <strong>Registros importados:</strong> {result.imported} de {result.total}
                  </p>
                  {result.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="mb-1 text-warning">
                        <strong>Errores encontrados:</strong>
                      </p>
                      <ul className="mb-0">
                        {result.errors.map((err, idx) => (
                          <li key={idx} className="small">{err}</li>
                        ))}
                        {result.hasMoreErrors && (
                          <li className="small text-muted">... y más errores</li>
                        )}
                      </ul>
                    </div>
                  )}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tipo de Datos a Importar</Form.Label>
                      <Form.Select
                        value={tableType}
                        onChange={(e) => setTableType(e.target.value)}
                        required
                      >
                        <option value="">Selecciona el tipo...</option>
                        {tableOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.icon} {option.label}
                          </option>
                        ))}
                      </Form.Select>
                      {tableType && (
                        <Form.Text className="text-muted">
                          {tableOptions.find(opt => opt.value === tableType)?.description}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                {/* Opciones de Manejo de Datos */}
                {tableType && (
                  <Row className="mb-3">
                    <Col>
                      <Card className="border-warning">
                        <Card.Body>
                          <h6 className="mb-3">
                            <FaInfoCircle className="text-warning me-2" />
                            ¿Qué hacer con los datos existentes?
                          </h6>
                          <Form.Check
                            type="radio"
                            id="append-data"
                            name="dataHandling"
                            label="📈 Agregar a los existentes (recomendado)"
                            checked={!replaceData}
                            onChange={() => setReplaceData(false)}
                          />
                          <Form.Text className="text-muted d-block mb-2 ms-4">
                            Los nuevos datos se agregarán sin eliminar los registros actuales.
                          </Form.Text>
                          <Form.Check
                            type="radio"
                            id="replace-data"
                            name="dataHandling"
                            label="🗑️ Reemplazar todos los datos existentes"
                            checked={replaceData}
                            onChange={() => setReplaceData(true)}
                          />
                          <Form.Text className="text-danger d-block ms-4">
                            ⚠️ CUIDADO: Se eliminarán TODOS los registros existentes antes de importar.
                          </Form.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                )}

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Archivo Excel</Form.Label>
                      <Form.Control
                        id="fileInput"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        required
                      />
                      <Form.Text className="text-muted">
                        Formatos soportados: .xlsx, .xls
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-2">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={loading || !file || !tableType}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <FaUpload className="me-2" />
                        Importar Datos
                      </>
                    )}
                  </Button>
                  
                  {tableType && (
                    <Button 
                      variant="outline-success" 
                      onClick={() => downloadTemplate(tableType)}
                      type="button"
                    >
                      <FaDownload className="me-2" />
                      Descargar Plantilla
                    </Button>
                  )}
                </div>

                {loading && (
                  <div className="mt-3">
                    <ProgressBar animated now={100} />
                    <small className="text-muted">Procesando archivo...</small>
                  </div>
                )}
              </Form>
            </Card.Body>
          </Card>

          {/* Información de columnas esperadas */}
          {tableType && (
            <Card>
              <Card.Header>
                <h6 className="mb-0">
                  <FaInfoCircle className="me-2" />
                  Columnas Esperadas para {tableOptions.find(t => t.value === tableType)?.label}
                </h6>
              </Card.Header>
              <Card.Body>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Columna</th>
                      <th>Requerida</th>
                      <th>Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableOptions.find(t => t.value === tableType)?.columns.map((col, idx) => (
                      <tr key={idx}>
                        <td>
                          <code>{col.name}</code>
                        </td>
                        <td>
                          <Badge bg={col.required ? 'danger' : 'secondary'}>
                            {col.required ? 'Sí' : 'No'}
                          </Badge>
                        </td>
                        <td>{col.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Alert variant="info" className="mt-3">
                  <small>
                    <strong>Nota:</strong> Las columnas pueden tener nombres alternativos (mayúsculas, minúsculas, con espacios o guiones bajos).
                    El sistema intentará mapear automáticamente las columnas más comunes.
                  </small>
                </Alert>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}

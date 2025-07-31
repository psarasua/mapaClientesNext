'use client';

import dynamic from 'next/dynamic';
import { Spinner } from 'react-bootstrap';

// Componente de carga personalizado
const LoadingComponent = () => (
  <div className="text-center p-2">
    <Spinner animation="border" size="sm" />
    <div><small className="text-muted">Cargando mapa...</small></div>
  </div>
);

// Import dinámico con manejo de errores mejorado
const LocationPickerMap = dynamic(
  () => import('./LocationPickerMap.jsx').catch(() => {
    // En caso de error, retorna un componente de fallback
    return {
      default: () => (
        <div className="alert alert-warning text-center">
          <p>No se pudo cargar el componente del mapa.</p>
          <small>Recarga la página para intentar nuevamente.</small>
        </div>
      )
    };
  }),
  {
    ssr: false,
    loading: LoadingComponent
  }
);

export default LocationPickerMap;

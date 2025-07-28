'use client';

import React, { useEffect, useState } from 'react';

// Coordenadas por defecto para Santa Rosa, Canelones, Uruguay
const DEFAULT_CENTER = [-34.5617, -56.0417];

const ClientMapComponent = ({ latitude, longitude, clientName, address }) => {
  const [isClient, setIsClient] = useState(false);
  const [mapComponents, setMapComponents] = useState(null);

  // Verificar si estamos en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Cargar Leaflet dinámicamente
  useEffect(() => {
    if (isClient) {
      const loadLeaflet = async () => {
        try {
          // Importar todos los componentes de react-leaflet de una vez
          const [leafletModule] = await Promise.all([
            import('react-leaflet')
          ]);

          setMapComponents({
            MapContainer: leafletModule.MapContainer,
            TileLayer: leafletModule.TileLayer,
            Marker: leafletModule.Marker,
          });
        } catch (error) {
          console.error('Error cargando Leaflet:', error);
        }
      };

      loadLeaflet();
    }
  }, [isClient]);

  // Verificar coordenadas válidas
  const hasValidCoords = latitude && longitude && 
    !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude));
  
  const position = hasValidCoords 
    ? [parseFloat(latitude), parseFloat(longitude)]
    : DEFAULT_CENTER;

  // Loading state
  if (!isClient || !mapComponents) {
    return (
      <div className="card h-100">
        <div className="card-header bg-primary text-white">
          <h6 className="mb-0">
            <i className="bi bi-geo-alt-fill me-2"></i>
            Ubicación del Cliente
          </h6>
        </div>
        <div className="card-body d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando mapa...</span>
            </div>
            <p className="text-muted mt-2 small">Cargando mapa...</p>
          </div>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker } = mapComponents;

  return (
    <div className="card h-100">
      <div className="card-header bg-primary text-white">
        <h6 className="mb-0">
          <i className="bi bi-geo-alt-fill me-2"></i>
          Ubicación del Cliente
        </h6>
      </div>
      <div className="card-body p-0">
        {/* Contenedor del Mapa */}
        <div style={{ 
          height: '300px', 
          width: '100%',
          backgroundColor: '#f8f9fa',
          position: 'relative'
        }}>
          <MapContainer
            center={position}
            zoom={hasValidCoords ? 15 : 12}
            style={{ 
              height: '100%', 
              width: '100%',
              zIndex: 1
            }}
            scrollWheelZoom={true}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
            {hasValidCoords && (
              <Marker position={position} />
            )}
          </MapContainer>
        </div>
        
        {/* Información del cliente */}
        <div className="p-3 border-top">
          <h6 className="mb-2">{clientName}</h6>
          <p className="text-muted mb-2 small">{address}</p>
          
          {hasValidCoords ? (
            <>
              <div className="alert alert-success py-2 mb-3">
                <small>
                  <strong>Coordenadas:</strong><br />
                  📍 Lat: {parseFloat(latitude).toFixed(6)}<br />
                  📍 Lng: {parseFloat(longitude).toFixed(6)}
                </small>
              </div>
              
              <div className="d-grid gap-2">
                <a 
                  href={`https://www.google.com/maps/dir//${latitude},${longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary btn-sm"
                >
                  <i className="bi bi-geo-alt me-2"></i>
                  Cómo llegar
                </a>
                <a 
                  href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-secondary btn-sm"
                >
                  <i className="bi bi-map me-2"></i>
                  Ver en OpenStreetMap
                </a>
              </div>
            </>
          ) : (
            <>
              <div className="alert alert-warning py-2 mb-3">
                <small>
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <strong>Sin coordenadas específicas</strong><br />
                  Mostrando Santa Rosa, Canelones, Uruguay como referencia
                </small>
              </div>
              
              <div className="d-grid gap-2">
                <a 
                  href={`https://www.google.com/maps/search/${encodeURIComponent(address || clientName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary btn-sm"
                >
                  <i className="bi bi-search me-2"></i>
                  Buscar en Google Maps
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientMapComponent;

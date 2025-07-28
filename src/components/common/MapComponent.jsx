'use client';

import React, { useState, useEffect } from 'react';

// Coordenadas por defecto para Santa Rosa, Canelones, Uruguay
const DEFAULT_CENTER = [-34.5617, -56.0417];

const MapComponent = ({ clients = [], trucks = [], showClients = true, showTrucks = true }) => {
  const [isClient, setIsClient] = useState(false);
  const [mapComponents, setMapComponents] = useState(null);

  // Verificar si estamos en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Cargar componentes de Leaflet dinámicamente
  useEffect(() => {
    if (isClient) {
      const loadLeaflet = async () => {
        try {
          const leafletModule = await import('react-leaflet');
          setMapComponents({
            MapContainer: leafletModule.MapContainer,
            TileLayer: leafletModule.TileLayer,
            Marker: leafletModule.Marker,
            Popup: leafletModule.Popup
          });
        } catch (error) {
          console.error('Error cargando Leaflet:', error);
        }
      };
      
      loadLeaflet();
    }
  }, [isClient]);

  // Filtrar elementos con coordenadas válidas
  const validClients = clients.filter(client => 
    client.latitude && client.longitude && 
    !isNaN(parseFloat(client.latitude)) && !isNaN(parseFloat(client.longitude))
  );
  
  const validTrucks = trucks.filter(truck => 
    truck.latitude && truck.longitude && 
    !isNaN(parseFloat(truck.latitude)) && !isNaN(parseFloat(truck.longitude))
  );

  // Determinar centro del mapa
  let mapCenter = DEFAULT_CENTER;
  let mapZoom = 12;

  const allItems = [];
  if (showClients) {
    allItems.push(...validClients.map(client => [
      parseFloat(client.latitude), 
      parseFloat(client.longitude)
    ]));
  }
  if (showTrucks) {
    allItems.push(...validTrucks.map(truck => [
      parseFloat(truck.latitude), 
      parseFloat(truck.longitude)
    ]));
  }

  if (allItems.length > 0) {
    const avgLat = allItems.reduce((sum, item) => sum + item[0], 0) / allItems.length;
    const avgLng = allItems.reduce((sum, item) => sum + item[1], 0) / allItems.length;
    mapCenter = [avgLat, avgLng];
    mapZoom = allItems.length === 1 ? 15 : 12;
  }

  // Mostrar loading mientras se cargan los componentes
  if (!isClient || !mapComponents) {
    return (
      <div style={{ 
        height: '400px', 
        width: '100%',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando mapa...</span>
          </div>
          <p className="text-muted mt-2 small">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup } = mapComponents;

  return (
    <div style={{ 
      height: '400px', 
      width: '100%',
      backgroundColor: '#f8f9fa',
      position: 'relative'
    }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
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
        
        {/* Marcadores de clientes */}
        {showClients && validClients.map((client) => (
          <Marker
            key={`client-${client.id}`}
            position={[parseFloat(client.latitude), parseFloat(client.longitude)]}
          >
            <Popup>
              <div>
                <h6 className="mb-2">👤 {client.name}</h6>
                <p className="mb-1 small text-muted">{client.address}</p>
                <p className="mb-1 small">
                  <strong>Reparto:</strong> {client.reparto || 'No asignado'}
                </p>
                <p className="mb-0 small">
                  <strong>Día:</strong> {client.diaEntrega || 'No definido'}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Marcadores de camiones */}
        {showTrucks && validTrucks.map((truck) => (
          <Marker
            key={`truck-${truck.id}`}
            position={[parseFloat(truck.latitude), parseFloat(truck.longitude)]}
          >
            <Popup>
              <div>
                <h6 className="mb-2">🚛 {truck.name}</h6>
                <p className="mb-1 small text-muted">{truck.description}</p>
                <p className="mb-0 small">
                  <strong>Estado:</strong> {truck.status || 'Activo'}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Overlay con información si no hay datos */}
      {(validClients.length === 0 && validTrucks.length === 0) && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          right: '10px',
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          <i className="bi bi-info-circle me-2"></i>
          Mostrando Santa Rosa, Canelones, Uruguay como ubicación por defecto
        </div>
      )}
    </div>
  );
};

export default MapComponent;

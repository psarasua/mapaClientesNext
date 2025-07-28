'use client';

import React, { useState, useCallback, useEffect } from 'react';

// Coordenadas por defecto para Santa Rosa, Canelones, Uruguay
const DEFAULT_CENTER = [-34.5617, -56.0417];

const LocationPickerMap = ({ 
  initialLatitude, 
  initialLongitude, 
  onLocationChange, 
  className = "" 
}) => {
  const [leafletComponents, setLeafletComponents] = useState(null);
  const [isClient, setIsClient] = useState(false);
  
  // Usar coordenadas iniciales si están disponibles, sino usar Santa Rosa, Canelones
  const hasInitialCoords = initialLatitude && initialLongitude && 
    !isNaN(parseFloat(initialLatitude)) && !isNaN(parseFloat(initialLongitude));
  
  const [position, setPosition] = useState(
    hasInitialCoords 
      ? [parseFloat(initialLatitude), parseFloat(initialLongitude)]
      : null
  );
  
  const [mapCenter] = useState(
    hasInitialCoords 
      ? [parseFloat(initialLatitude), parseFloat(initialLongitude)]
      : DEFAULT_CENTER
  );
  
  const [inputLat, setInputLat] = useState(
    hasInitialCoords ? parseFloat(initialLatitude).toFixed(6) : ''
  );
  
  const [inputLng, setInputLng] = useState(
    hasInitialCoords ? parseFloat(initialLongitude).toFixed(6) : ''
  );

  // Verificar si estamos en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Cargar componentes de Leaflet dinámicamente
  useEffect(() => {
    if (isClient) {
      const loadLeaflet = async () => {
        try {
          const leaflet = await import('react-leaflet');
          setLeafletComponents({
            MapContainer: leaflet.MapContainer,
            TileLayer: leaflet.TileLayer,
            Marker: leaflet.Marker,
            useMapEvents: leaflet.useMapEvents
          });
        } catch (error) {
          console.error('Error cargando Leaflet:', error);
        }
      };
      
      loadLeaflet();
    }
  }, [isClient]);

  const handleLocationSelect = useCallback((lat, lng) => {
    const newPosition = [lat, lng];
    setPosition(newPosition);
    setInputLat(lat.toFixed(6));
    setInputLng(lng.toFixed(6));
    
    if (onLocationChange) {
      onLocationChange(lat, lng);
    }
  }, [onLocationChange]);

  const handleManualCoordinateChange = () => {
    const lat = parseFloat(inputLat);
    const lng = parseFloat(inputLng);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      handleLocationSelect(lat, lng);
    }
  };

  const clearLocation = () => {
    setPosition(null);
    setInputLat('');
    setInputLng('');
    
    if (onLocationChange) {
      onLocationChange(null, null);
    }
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleLocationSelect(latitude, longitude);
        },
        (error) => {
          console.error('Error obteniendo ubicación actual:', error);
          alert('No se pudo obtener la ubicación actual. Verifique los permisos del navegador.');
        }
      );
    } else {
      alert('Geolocalización no soportada por este navegador.');
    }
  };

  // Componente para manejar eventos del mapa
  const MapEvents = ({ onLocationSelect }) => {
    if (!leafletComponents) return null;
    
    const { useMapEvents } = leafletComponents;
    
    const MapEventsComponent = () => {
      useMapEvents({
        click: (e) => {
          const { lat, lng } = e.latlng;
          onLocationSelect(lat, lng);
        },
      });
      return null;
    };
    
    return <MapEventsComponent />;
  };

  // Mostrar loading mientras se cargan los componentes
  if (!isClient || !leafletComponents) {
    return (
      <div className={`location-picker-map ${className}`}>
        <div className="card mb-3">
          <div className="card-header bg-success text-white">
            <h6 className="mb-0">
              <i className="bi bi-geo-alt-fill me-2"></i>
              Seleccionar Ubicación
            </h6>
          </div>
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-center">
              <div className="text-center">
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Cargando mapa...</span>
                </div>
                <p className="text-muted mt-2 small">Cargando mapa...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker } = leafletComponents;

  return (
    <div className={`location-picker-map ${className}`}>
      {/* Controles de ubicación */}
      <div className="card mb-3">
        <div className="card-header bg-success text-white">
          <h6 className="mb-0">
            <i className="bi bi-geo-alt-fill me-2"></i>
            Seleccionar Ubicación
          </h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <label className="form-label small">Latitud</label>
              <input
                type="number"
                step="any"
                className="form-control form-control-sm"
                value={inputLat}
                onChange={(e) => setInputLat(e.target.value)}
                onBlur={handleManualCoordinateChange}
                placeholder="Ej: -34.5617"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Longitud</label>
              <input
                type="number"
                step="any"
                className="form-control form-control-sm"
                value={inputLng}
                onChange={(e) => setInputLng(e.target.value)}
                onBlur={handleManualCoordinateChange}
                placeholder="Ej: -56.0417"
              />
            </div>
          </div>
          
          <div className="d-flex gap-2 mt-3">
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={useCurrentLocation}
            >
              <i className="bi bi-crosshair me-1"></i>
              Mi ubicación
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={clearLocation}
            >
              <i className="bi bi-x-circle me-1"></i>
              Limpiar
            </button>
          </div>
          
          {!hasInitialCoords && !position && (
            <div className="alert alert-info py-2 mt-3 mb-0">
              <small>
                <i className="bi bi-info-circle me-2"></i>
                Mapa centrado en Santa Rosa, Canelones, Uruguay. Haga clic en el mapa para seleccionar una ubicación.
              </small>
            </div>
          )}
        </div>
      </div>

      {/* Mapa interactivo */}
      <div style={{ height: '400px', width: '100%' }}>
        <MapContainer
          center={mapCenter}
          zoom={hasInitialCoords ? 15 : 12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapEvents onLocationSelect={handleLocationSelect} />
          
          {position && <Marker position={position} />}
        </MapContainer>
      </div>

      {/* Información adicional */}
      <div className="mt-3">
        <div className="card">
          <div className="card-body py-2">
            <div className="row align-items-center">
              <div className="col">
                <small className="text-muted">
                  <i className="bi bi-hand-index me-1"></i>
                  Haga clic en el mapa para seleccionar coordenadas
                </small>
              </div>
              {position && (
                <div className="col-auto">
                  <span className="badge bg-success">
                    <i className="bi bi-check-circle me-1"></i>
                    Ubicación seleccionada
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerMap;

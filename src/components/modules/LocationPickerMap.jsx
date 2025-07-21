'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para los iconos de Leaflet en Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para manejar los clics en el mapa
function LocationPicker({ onLocationSelect, currentPosition }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

const LocationPickerMap = ({ 
  latitude = -33.4489, 
  longitude = -70.6693, 
  onLocationChange,
  height = '400px'
}) => {
  const [position, setPosition] = useState([latitude, longitude]);
  const mapRef = useRef();

  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const handleLocationSelect = (latlng) => {
    const newPosition = [latlng.lat, latlng.lng];
    setPosition(newPosition);
    if (onLocationChange) {
      onLocationChange({
        latitude: latlng.lat,
        longitude: latlng.lng
      });
    }
  };

  return (
    <div>
      {/* Coordenadas actuales */}
      <div className="mb-3 p-2 bg-light rounded">
        <strong>Coordenadas seleccionadas:</strong><br/>
        <code>
          Latitud: {position[0].toFixed(6)}, Longitud: {position[1].toFixed(6)}
        </code>
      </div>

      {/* Mapa */}
      <div style={{ height, width: '100%' }} className="rounded border">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          className="rounded"
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Marcador movible */}
          {position && (
            <Marker 
              position={position}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const newPosition = marker.getLatLng();
                  setPosition([newPosition.lat, newPosition.lng]);
                  if (onLocationChange) {
                    onLocationChange({
                      latitude: newPosition.lat,
                      longitude: newPosition.lng
                    });
                  }
                }
              }}
            />
          )}
          
          {/* Componente para manejar clics en el mapa */}
          <LocationPicker 
            onLocationSelect={handleLocationSelect}
            currentPosition={position}
          />
        </MapContainer>
      </div>
      
      <div className="mt-2">
        <small className="text-muted">
          💡 <strong>Instrucciones:</strong> Haz clic en cualquier lugar del mapa o arrastra el marcador para seleccionar la ubicación.
        </small>
      </div>
    </div>
  );
};

export default LocationPickerMap;

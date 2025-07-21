'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para los iconos de Leaflet en Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapComponent = ({ latitude, longitude, clientName, address }) => {
  const position = [latitude, longitude];
  
  // Verificar que las coordenadas sean válidas
  if (!latitude || !longitude) {
    return (
      <div className="d-flex align-items-center justify-content-center h-100 bg-light rounded">
        <div className="text-center">
          <i className="bi bi-geo-alt-fill fs-1 text-muted"></i>
          <p className="text-muted mt-2">Sin coordenadas disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={position}
      zoom={16}
      style={{ height: '100%', width: '100%' }}
      className="rounded"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          <div>
            <strong>{clientName}</strong><br/>
            {address && (
              <>
                <small className="text-muted">{address}</small><br/>
              </>
            )}
            <small>
              📍 {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </small>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapComponent;

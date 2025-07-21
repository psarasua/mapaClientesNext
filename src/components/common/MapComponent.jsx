'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Importar Leaflet dinámicamente para evitar problemas de SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

export default function MapComponent() {
  const [isClient, setIsClient] = useState(false);
  const [clients, setClients] = useState([]);
  const [trucks, setTrucks] = useState([]);
  
  // Coordenadas por defecto (Madrid, España)
  const defaultPosition = [40.4168, -3.7038];
  
  useEffect(() => {
    setIsClient(true);
    fetchLocationData();
  }, []);

  const fetchLocationData = async () => {
    try {
      const [clientsRes, trucksRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/trucks')
      ]);
      
      const clientsData = await clientsRes.json();
      const trucksData = await trucksRes.json();
      
      // Extraer los arrays de las respuestas
      const clients = clientsData.clients || [];
      const trucks = trucksData.trucks || [];
      
      // Agregar coordenadas aleatorias para demostración
      const clientsWithCoords = clients.map((client, index) => ({
        ...client,
        lat: 40.4168 + (Math.random() - 0.5) * 0.1,
        lng: -3.7038 + (Math.random() - 0.5) * 0.1,
        type: 'client'
      }));
      
      const trucksWithCoords = trucks.map((truck, index) => ({
        ...truck,
        lat: 40.4168 + (Math.random() - 0.5) * 0.15,
        lng: -3.7038 + (Math.random() - 0.5) * 0.15,
        type: 'truck'
      }));
      
      setClients(clientsWithCoords);
      setTrucks(trucksWithCoords);
    } catch (error) {
      console.error('Error fetching location data:', error);
    }
  };

  // Función para crear iconos personalizados
  const createCustomIcon = (type) => {
    if (typeof window === 'undefined') return null;
    
    const L = require('leaflet');
    
    const iconConfig = {
      client: {
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#dc3545" width="24" height="24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        `),
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24]
      },
      truck: {
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#198754" width="24" height="24">
            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
        `),
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24]
      }
    };
    
    return L.icon(iconConfig[type]);
  };

  if (!isClient) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: '250px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando mapa...</span>
          </div>
          <p className="mt-2 mb-0">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '250px', width: '100%' }}>
      <MapContainer
        center={defaultPosition}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        className="leaflet-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Marcadores de Clientes */}
        {clients.map((client) => (
          <Marker
            key={`client-${client.id}`}
            position={[client.lat, client.lng]}
            icon={createCustomIcon('client')}
          >
            <Popup>
              <div>
                <strong>👤 Cliente</strong><br />
                <strong>{client.name}</strong><br />
                📧 {client.email}<br />
                📞 {client.phone}
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Marcadores de Camiones */}
        {trucks.map((truck) => (
          <Marker
            key={`truck-${truck.id}`}
            position={[truck.lat, truck.lng]}
            icon={createCustomIcon('truck')}
          >
            <Popup>
              <div>
                <strong>🚛 Camión</strong><br />
                <strong>{truck.name}</strong><br />
                📋 {truck.description}<br />
                🔧 Estado: {truck.status || 'Disponible'}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';

const MapDiagnostic = () => {
  const [tileStatus, setTileStatus] = useState('checking');
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [tileProviders, setTileProviders] = useState([]);
  
  const TILE_PROVIDERS_TO_TEST = [
    { name: 'OpenStreetMap', url: 'https://tile.openstreetmap.org/0/0/0.png' },
    { name: 'OpenStreetMap France', url: 'https://a.tile.openstreetmap.fr/osmfr/0/0/0.png' },
    { name: 'CartoDB', url: 'https://a.basemaps.cartocdn.com/light_all/0/0/0.png' }
  ];
  
  useEffect(() => {
    // Verificar conexión a internet
    const checkConnection = () => {
      setConnectionStatus(navigator.onLine ? 'online' : 'offline');
    };
    
    // Verificar múltiples proveedores de tiles
    const checkTileProviders = async () => {
      const results = [];
      
      for (const provider of TILE_PROVIDERS_TO_TEST) {
        try {
          const img = new Image();
          const loadPromise = new Promise((resolve) => {
            img.onload = () => resolve({ ...provider, status: 'success' });
            img.onerror = () => resolve({ ...provider, status: 'error' });
            setTimeout(() => resolve({ ...provider, status: 'timeout' }), 5000);
          });
          
          img.src = provider.url;
          const result = await loadPromise;
          results.push(result);
        } catch (error) {
          results.push({ ...provider, status: 'error' });
        }
      }
      
      setTileProviders(results);
      
      // Determinar estado general
      const hasSuccess = results.some(r => r.status === 'success');
      setTileStatus(hasSuccess ? 'success' : 'error');
    };
    
    checkConnection();
    checkTileProviders();
    
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);
    
    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);
  
  // Solo mostrar si hay problemas
  if (connectionStatus === 'online' && tileStatus === 'success') return null;
  
  return (
    <div className="alert alert-warning mb-3" role="alert">
      <h6 className="alert-heading">
        <i className="bi bi-exclamation-triangle me-2"></i>
        Diagnóstico de Mapas
      </h6>
      
      <div className="d-flex align-items-center mb-2">
        <span className="me-2">Conexión a Internet:</span>
        {connectionStatus === 'online' ? (
          <span className="badge bg-success">
            <i className="bi bi-check-circle me-1"></i>Conectado
          </span>
        ) : connectionStatus === 'offline' ? (
          <span className="badge bg-danger">
            <i className="bi bi-x-circle me-1"></i>Sin conexión
          </span>
        ) : (
          <span className="badge bg-secondary">
            <i className="bi bi-hourglass-split me-1"></i>Verificando...
          </span>
        )}
      </div>
      
      <div className="mb-2">
        <span className="me-2">Proveedores de Tiles:</span>
        <div className="mt-1">
          {tileProviders.map((provider, index) => (
            <div key={index} className="d-flex align-items-center mb-1">
              <small className="me-2">{provider.name}:</small>
              {provider.status === 'success' ? (
                <span className="badge bg-success me-2">
                  <i className="bi bi-check-circle me-1"></i>OK
                </span>
              ) : provider.status === 'error' ? (
                <span className="badge bg-danger me-2">
                  <i className="bi bi-x-circle me-1"></i>Error
                </span>
              ) : provider.status === 'timeout' ? (
                <span className="badge bg-warning me-2">
                  <i className="bi bi-clock me-1"></i>Timeout
                </span>
              ) : (
                <span className="badge bg-secondary me-2">
                  <i className="bi bi-hourglass-split me-1"></i>Probando...
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-2">
        {connectionStatus === 'offline' && (
          <small className="text-muted d-block">
            <strong>Solución:</strong> Verifica tu conexión a internet.
          </small>
        )}
        
        {tileStatus === 'error' && connectionStatus === 'online' && (
          <small className="text-muted d-block">
            <strong>Posibles soluciones:</strong>
            <ul className="mb-0 mt-1">
              <li>Refrescar la página (Ctrl + F5)</li>
              <li>Limpiar caché del navegador</li>
              <li>Probar en modo incógnito</li>
              <li>Los tiles pueden estar temporalmente no disponibles</li>
            </ul>
          </small>
        )}
      </div>
    </div>
  );
};

export default MapDiagnostic;

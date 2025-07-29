'use client';

import React, { useState, useEffect } from 'react';

// Proveedores de tiles alternativos
const TILE_PROVIDERS = [
  {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  {
    name: 'OpenStreetMap France',
    url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  {
    name: 'CartoDB Positron',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }
];

const TileLayerWithFallback = ({ TileLayer }) => {
  const [currentProviderIndex, setCurrentProviderIndex] = useState(0);
  const [failedProviders, setFailedProviders] = useState(new Set());

  const currentProvider = TILE_PROVIDERS[currentProviderIndex];

  const handleTileError = () => {
    const nextIndex = (currentProviderIndex + 1) % TILE_PROVIDERS.length;
    
    if (!failedProviders.has(currentProviderIndex)) {
      setFailedProviders(prev => new Set([...prev, currentProviderIndex]));
      
      // Si no hemos probado todos los proveedores, cambiar al siguiente
      if (failedProviders.size < TILE_PROVIDERS.length - 1) {
        console.warn(`Tile provider ${currentProvider.name} failed, switching to ${TILE_PROVIDERS[nextIndex].name}`);
        setCurrentProviderIndex(nextIndex);
      }
    }
  };

  return (
    <TileLayer
      key={`provider-${currentProviderIndex}`}
      attribution={currentProvider.attribution}
      url={currentProvider.url}
      maxZoom={19}
      minZoom={1}
      tileSize={256}
      zoomOffset={0}
      crossOrigin={true}
      updateWhenIdle={false}
      updateWhenZooming={true}
      keepBuffer={2}
      eventHandlers={{
        tileerror: handleTileError
      }}
      errorTileUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    />
  );
};

export default TileLayerWithFallback;

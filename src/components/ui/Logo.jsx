'use client';

import React from 'react';

// Logo completo para headers y páginas principales
export const Logo = ({ width = 200, height = 60, className = "" }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 200 60" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Fondo del logo */}
      <rect x="0" y="0" width="200" height="60" rx="8" fill="#2c3e50"/>
      
      {/* Icono de mapa */}
      <g transform="translate(10, 10)">
        {/* Base del mapa */}
        <rect x="0" y="0" width="40" height="40" rx="4" fill="#18bc9c" stroke="#ffffff" strokeWidth="2"/>
        
        {/* Marcadores en el mapa */}
        <circle cx="12" cy="15" r="3" fill="#e74c3c"/>
        <circle cx="28" cy="12" r="3" fill="#f39c12"/>
        <circle cx="20" cy="25" r="3" fill="#3498db"/>
        <circle cx="32" cy="30" r="3" fill="#9b59b6"/>
        
        {/* Líneas de conexión */}
        <path d="M12,15 L20,25 L28,12 L32,30" stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.7"/>
        
        {/* Detalle de cuadrícula */}
        <line x1="0" y1="13" x2="40" y2="13" stroke="#ffffff" strokeWidth="0.5" opacity="0.3"/>
        <line x1="0" y1="26" x2="40" y2="26" stroke="#ffffff" strokeWidth="0.5" opacity="0.3"/>
        <line x1="13" y1="0" x2="13" y2="40" stroke="#ffffff" strokeWidth="0.5" opacity="0.3"/>
        <line x1="26" y1="0" x2="26" y2="40" stroke="#ffffff" strokeWidth="0.5" opacity="0.3"/>
      </g>
      
      {/* Texto del logo */}
      <text x="60" y="25" fontFamily="Inter, Arial, sans-serif" fontSize="18" fontWeight="700" fill="#ffffff">
        MapaClientes
      </text>
      <text x="60" y="42" fontFamily="Inter, Arial, sans-serif" fontSize="11" fontWeight="400" fill="#95a5a6">
        Sistema de Gestión
      </text>
      
      {/* Elemento decorativo */}
      <circle cx="185" cy="15" r="8" fill="#18bc9c" opacity="0.3"/>
      <circle cx="185" cy="15" r="4" fill="#18bc9c"/>
    </svg>
  );
};

// Logo pequeño para navbar y espacios reducidos
export const LogoSmall = ({ size = 32, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Fondo circular */}
      <circle cx="16" cy="16" r="16" fill="#18bc9c"/>
      
      {/* Icono de mapa simplificado */}
      <rect x="8" y="8" width="16" height="16" rx="2" fill="#ffffff" opacity="0.9"/>
      
      {/* Marcadores */}
      <circle cx="12" cy="12" r="1.5" fill="#e74c3c"/>
      <circle cx="20" cy="14" r="1.5" fill="#f39c12"/>
      <circle cx="14" cy="20" r="1.5" fill="#3498db"/>
      <circle cx="20" cy="20" r="1.5" fill="#9b59b6"/>
      
      {/* Líneas de conexión */}
      <path d="M12,12 L14,20 L20,14 L20,20" stroke="#2c3e50" strokeWidth="1" fill="none" opacity="0.6"/>
    </svg>
  );
};

// Logo solo texto para casos especiales
export const LogoText = ({ fontSize = 18, className = "" }) => {
  return (
    <span 
      className={`fw-bold ${className}`}
      style={{ 
        fontFamily: 'Inter, Arial, sans-serif',
        fontSize: `${fontSize}px`,
        color: '#2c3e50'
      }}
    >
      MapaClientes
    </span>
  );
};

export default Logo;

'use client';

import React from 'react';

// Logo horizontal para headers anchos
export const LogoHorizontal = ({ width = 300, height = 50, className = "" }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 300 50" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Fondo del logo */}
      <rect x="0" y="0" width="300" height="50" rx="6" fill="#2c3e50"/>
      
      {/* Icono de mapa compacto */}
      <g transform="translate(8, 8)">
        {/* Base del mapa */}
        <rect x="0" y="0" width="34" height="34" rx="3" fill="#18bc9c" stroke="#ffffff" strokeWidth="1.5"/>
        
        {/* Marcadores en el mapa */}
        <circle cx="10" cy="12" r="2.5" fill="#e74c3c"/>
        <circle cx="24" cy="10" r="2.5" fill="#f39c12"/>
        <circle cx="17" cy="22" r="2.5" fill="#3498db"/>
        <circle cx="27" cy="26" r="2.5" fill="#9b59b6"/>
        
        {/* Líneas de conexión */}
        <path d="M10,12 L17,22 L24,10 L27,26" stroke="#ffffff" strokeWidth="1.2" fill="none" opacity="0.7"/>
        
        {/* Cuadrícula simplificada */}
        <line x1="0" y1="11" x2="34" y2="11" stroke="#ffffff" strokeWidth="0.4" opacity="0.3"/>
        <line x1="0" y1="22" x2="34" y2="22" stroke="#ffffff" strokeWidth="0.4" opacity="0.3"/>
        <line x1="11" y1="0" x2="11" y2="34" stroke="#ffffff" strokeWidth="0.4" opacity="0.3"/>
        <line x1="22" y1="0" x2="22" y2="34" stroke="#ffffff" strokeWidth="0.4" opacity="0.3"/>
      </g>
      
      {/* Texto del logo */}
      <text x="52" y="22" fontFamily="Inter, Arial, sans-serif" fontSize="16" fontWeight="700" fill="#ffffff">
        MapaClientes
      </text>
      <text x="52" y="36" fontFamily="Inter, Arial, sans-serif" fontSize="9" fontWeight="400" fill="#95a5a6">
        Sistema de Gestión Logística
      </text>
      
      {/* Elementos decorativos */}
      <circle cx="275" cy="15" r="6" fill="#18bc9c" opacity="0.3"/>
      <circle cx="275" cy="15" r="3" fill="#18bc9c"/>
      <circle cx="285" cy="35" r="4" fill="#3498db" opacity="0.4"/>
      <circle cx="285" cy="35" r="2" fill="#3498db"/>
    </svg>
  );
};

export default LogoHorizontal;

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Badge, Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { FaMapMarkerAlt, FaRoute, FaTruck, FaUsers } from 'react-icons/fa';


export default function AnimatedMap({ 
  clients = [], 
  trucks = [], 
  repartos = [],
  onClientClick,
  onTruckClick,
  onRepartoClick 
}) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [mapView, setMapView] = useState('all'); // all, clients, trucks, repartos

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    }
  };

  const getItemIcon = (type) => {
    switch(type) {
      case 'client': return <FaMapMarkerAlt className="text-primary" />;
      case 'truck': return <FaTruck className="text-success" />;
      case 'reparto': return <FaRoute className="text-warning" />;
      default: return <FaUsers className="text-info" />;
    }
  };

  const getItemColor = (type) => {
    switch(type) {
      case 'client': return 'primary';
      case 'truck': return 'success';
      case 'reparto': return 'warning';
      default: return 'info';
    }
  };

  const filterItems = () => {
    switch(mapView) {
      case 'clients': return clients;
      case 'trucks': return trucks;
      case 'repartos': return repartos;
      default: return [...clients, ...trucks, ...repartos];
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="animated-map-container"
    >
      {/* Controles del mapa */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex gap-2">
                     <Badge
             bg={mapView === 'all' ? 'primary' : 'secondary'}
             onClick={() => setMapView('all')}
             style={{ cursor: 'pointer' }}
           >
             Todos
           </Badge>
           <Badge
             bg={mapView === 'clients' ? 'primary' : 'secondary'}
             onClick={() => setMapView('clients')}
             style={{ cursor: 'pointer' }}
           >
             Clientes
           </Badge>
           <Badge
             bg={mapView === 'trucks' ? 'primary' : 'secondary'}
             onClick={() => setMapView('trucks')}
             style={{ cursor: 'pointer' }}
           >
             Camiones
           </Badge>
           <Badge
             bg={mapView === 'repartos' ? 'primary' : 'secondary'}
             onClick={() => setMapView('repartos')}
             style={{ cursor: 'pointer' }}
           >
             Repartos
           </Badge>
        </div>
        
        <div className="text-muted small">
          {filterItems().length} elementos mostrados
        </div>
      </div>

      {/* Contenedor del mapa */}
             <Card className="map-container shadow">
        <div className="position-relative" style={{ height: '500px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          {/* Elementos del mapa */}
          <AnimatePresence>
            {filterItems().map((item, index) => (
              <motion.div
                key={`${item.type || 'item'}-${index}`}
                variants={itemVariants}
                whileHover="hover"
                className="position-absolute"
                style={{
                  left: `${item.Coordenada_x || Math.random() * 80 + 10}%`,
                  top: `${item.Coordenada_y || Math.random() * 80 + 10}%`,
                  zIndex: selectedItem === item ? 10 : 1
                }}
              >
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip>
                      <strong>{item.Nombre || item.Razon || item.Codigo}</strong>
                      <br />
                      {item.Direccion || item.Descripcion || 'Sin descripción'}
                    </Tooltip>
                  }
                >
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedItem(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={`bg-${getItemColor(item.type || 'client')} bg-opacity-75 rounded-circle p-2 shadow-lg`}>
                      {getItemIcon(item.type || 'client')}
                    </div>
                  </motion.div>
                </OverlayTrigger>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Información del elemento seleccionado */}
          <AnimatePresence>
            {selectedItem && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="position-absolute bottom-0 start-0 m-3"
                style={{ zIndex: 20 }}
              >
                                 <Card className="bg-light bg-opacity-75 shadow">
                  <Card.Body className="p-3">
                    <div className="d-flex align-items-center mb-2">
                      {getItemIcon(selectedItem.type || 'client')}
                      <h6 className="mb-0 ms-2 text-white">
                        {selectedItem.Nombre || selectedItem.Razon || selectedItem.Codigo}
                      </h6>
                    </div>
                    <p className="text-white-50 small mb-2">
                      {selectedItem.Direccion || selectedItem.Descripcion || 'Sin descripción'}
                    </p>
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        variant="outline-light"
                        onClick={() => {
                          if (onClientClick && selectedItem.type === 'client') onClientClick(selectedItem);
                          if (onTruckClick && selectedItem.type === 'truck') onTruckClick(selectedItem);
                          if (onRepartoClick && selectedItem.type === 'reparto') onRepartoClick(selectedItem);
                        }}
                      >
                        Ver detalles
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-light"
                        onClick={() => setSelectedItem(null)}
                      >
                        Cerrar
                      </Button>
                    </div>
                                     </Card.Body>
                 </Card>
               </motion.div>
             )}
           </AnimatePresence>
         </div>
       </Card>
    </motion.div>
  );
} 
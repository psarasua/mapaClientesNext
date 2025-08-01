'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toast, ToastContainer } from 'react-bootstrap';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimesCircle } from 'react-icons/fa';

// Context para manejar notificaciones globalmente
import { createContext, useContext, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ 
    type = 'info', 
    title, 
    message, 
    duration = 5000,
    position = 'top-right'
  }) => {
    const id = Date.now() + Math.random();
    const newToast = { id, type, title, message, duration, position };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((title, message) => {
    addToast({ type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((title, message) => {
    addToast({ type: 'danger', title, message });
  }, [addToast]);

  const warning = useCallback((title, message) => {
    addToast({ type: 'warning', title, message });
  }, [addToast]);

  const info = useCallback((title, message) => {
    addToast({ type: 'info', title, message });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, success, error, warning, info, removeToast }}>
      {children}
      <ToastNotificationsContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Componente de contenedor de notificaciones
function ToastNotificationsContainer({ toasts, onRemove }) {
  const getIcon = (type) => {
    switch(type) {
      case 'success': return <FaCheckCircle className="text-success" />;
      case 'danger': return <FaTimesCircle className="text-danger" />;
      case 'warning': return <FaExclamationTriangle className="text-warning" />;
      case 'info': return <FaInfoCircle className="text-info" />;
      default: return <FaInfoCircle className="text-info" />;
    }
  };

  const getVariant = (type) => {
    switch(type) {
      case 'success': return 'success';
      case 'danger': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  };

  return (
    <ToastContainer 
      position="top-end" 
      className="p-3"
      style={{ zIndex: 9999 }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <Toast 
              onClose={() => onRemove(toast.id)}
              bg={getVariant(toast.type)}
              className="border-0 shadow-lg"
              style={{ minWidth: '300px' }}
            >
              <Toast.Header className="border-0">
                <div className="d-flex align-items-center me-2">
                  {getIcon(toast.type)}
                </div>
                <strong className="me-auto">{toast.title}</strong>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => onRemove(toast.id)}
                  aria-label="Cerrar"
                />
              </Toast.Header>
              <Toast.Body className="text-white">
                {toast.message}
              </Toast.Body>
            </Toast>
          </motion.div>
        ))}
      </AnimatePresence>
    </ToastContainer>
  );
}

// Componente de notificación individual
export function NotificationToast({ 
  type = 'info', 
  title, 
  message, 
  onClose,
  duration = 5000 
}) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = (type) => {
    switch(type) {
      case 'success': return <FaCheckCircle className="text-success" />;
      case 'danger': return <FaTimesCircle className="text-danger" />;
      case 'warning': return <FaExclamationTriangle className="text-warning" />;
      case 'info': return <FaInfoCircle className="text-info" />;
      default: return <FaInfoCircle className="text-info" />;
    }
  };

  const getVariant = (type) => {
    switch(type) {
      case 'success': return 'success';
      case 'danger': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
    >
      <Toast 
        show={show} 
        onClose={() => {
          setShow(false);
          onClose?.();
        }}
        bg={getVariant(type)}
        className="border-0 shadow-lg"
      >
        <Toast.Header className="border-0">
          <div className="d-flex align-items-center me-2">
            {getIcon(type)}
          </div>
          <strong className="me-auto">{title}</strong>
          <button
            type="button"
            className="btn-close"
            onClick={() => {
              setShow(false);
              onClose?.();
            }}
            aria-label="Cerrar"
          />
        </Toast.Header>
        <Toast.Body className="text-white">
          {message}
        </Toast.Body>
      </Toast>
    </motion.div>
  );
} 
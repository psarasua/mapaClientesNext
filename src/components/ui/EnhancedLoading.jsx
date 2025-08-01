import React from 'react';
import { motion } from 'framer-motion';
import { Spinner, Card } from 'react-bootstrap';


export default function EnhancedLoading({ 
  message = 'Cargando...', 
  size = 'lg',
  showCard = true,
  className = ''
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const content = (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`text-center ${className}`}
    >
      <motion.div
        variants={itemVariants}
        className="mb-3"
      >
        <motion.div
          variants={spinnerVariants}
          animate="animate"
          className="d-inline-block"
        >
          <Spinner 
            animation="border" 
            variant="primary"
            size={size}
            style={{ width: '3rem', height: '3rem' }}
          />
        </motion.div>
      </motion.div>
      
      <motion.div
        variants={itemVariants}
        className="text-muted"
      >
        <h5 className="mb-0">{message}</h5>
        <small className="text-muted">Por favor espera...</small>
      </motion.div>
    </motion.div>
  );

  if (showCard) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Card className="p-5 shadow">
          {content}
                  </Card>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
      {content}
    </div>
  );
}

// Componente de skeleton loading
export function SkeletonLoader({ 
  rows = 3, 
  height = '20px',
  className = ''
}) {
  return (
    <div className={className}>
      {Array.from({ length: rows }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="mb-3"
        >
          <div 
            className="skeleton"
            style={{
              height,
              backgroundColor: '#f0f0f0',
              borderRadius: '8px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

// Componente de loading para tablas
export function TableSkeleton({ columns = 5, rows = 5 }) {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index}>
                <div 
                  className="skeleton"
                  style={{
                    height: '20px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex}>
                  <div 
                    className="skeleton"
                    style={{
                      height: '16px',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '4px',
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 
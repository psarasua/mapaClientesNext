import { useState, useEffect } from 'react';

export default function DeployBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deployTime, setDeployTime] = useState('');

  useEffect(() => {
    // Mostrar banner por 10 segundos al cargar la página
    setShowBanner(true);
    setDeployTime(new Date().toLocaleString('es-ES'));
    
    const timer = setTimeout(() => {
      setShowBanner(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (!showBanner) return null;

  return (
    <div className="alert alert-success alert-dismissible fade show" role="alert">
      <div className="d-flex align-items-center">
        <i className="bi bi-check-circle-fill me-2 fs-4"></i>
        <div>
          <strong>🚀 Deploy Automático Confirmado!</strong>
          <br />
          <small className="text-muted">
            Último deploy: {deployTime} | 
            Tema: Solar (Naranja) | 
            Estado: Activo
          </small>
        </div>
      </div>
      <button 
        type="button" 
        className="btn-close" 
        onClick={() => setShowBanner(false)}
        aria-label="Cerrar"
      ></button>
    </div>
  );
} 
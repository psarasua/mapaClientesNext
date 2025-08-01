'use client';

import { Card } from 'react-bootstrap';

export default function StatsCard({ icon, title, value, color, subtitle, trend, trendValue }) {
  const getTrendIcon = () => {
    if (!trend) return null;
    return trend === 'up' ? '↗️' : '↘️';
  };

  const getTrendColor = () => {
    if (!trend) return 'text-muted';
    return trend === 'up' ? 'text-success' : 'text-danger';
  };

  return (
    <Card 
      className="h-100 shadow"
    >
      <Card.Body className="p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className={`rounded-circle bg-${color} bg-opacity-10 p-3`}>
            <div className={`text-${color} fs-3`}>
              {icon}
            </div>
          </div>
          {trend && (
            <div className={`${getTrendColor()} d-flex align-items-center`}>
              <span className="me-1">{getTrendIcon()}</span>
              <small className="fw-bold">{trendValue}</small>
            </div>
          )}
        </div>
        
        <div className="flex-grow-1">
          <div className="fw-bold fs-2 mb-1 text-dark">{value}</div>
          <div className="text-muted fw-semibold mb-1">{title}</div>
          {subtitle && (
            <div className="text-muted small opacity-75">
              {subtitle}
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

'use client';

import { Card } from 'react-bootstrap';

export default function StatsCard({ icon, title, value, color, subtitle }) {
  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Body className="d-flex align-items-center">
        <div className={`rounded-circle bg-${color} bg-opacity-10 p-3 me-3`}>
          <div className={`text-${color} fs-4`}>
            {icon}
          </div>
        </div>
        <div className="flex-grow-1">
          <div className="fw-bold fs-5 mb-0">{value}</div>
          <div className="text-muted small">{title}</div>
          {subtitle && (
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
              {subtitle}
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

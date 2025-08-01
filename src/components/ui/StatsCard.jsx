'use client';

import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { Card } from 'react-bootstrap';

export default function StatsCard({ icon, title, value, color, subtitle, trend, trendValue }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend === 'up' ? '↗️' : '↘️';
  };

  const getTrendColor = () => {
    if (!trend) return 'text-muted';
    return trend === 'up' ? 'text-success' : 'text-danger';
  };

  const getColorClass = () => {
    switch(color) {
      case 'primary': return 'bg-primary';
      case 'success': return 'bg-success';
      case 'info': return 'bg-info';
      case 'warning': return 'bg-warning';
      case 'danger': return 'bg-danger';
      default: return 'bg-primary';
    }
  };

  const variants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const iconVariants = {
    hidden: { 
      scale: 0,
      rotate: -180
    },
    visible: { 
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.6,
        delay: 0.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const valueVariants = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
    >
      <Card className="h-100 stats-card hover-lift">
        <Card.Body className="p-4 text-center">
          <motion.div 
            className="stats-icon mx-auto mb-3" 
            style={{ backgroundColor: `var(--${color}-color)` }}
            variants={iconVariants}
          >
            {icon}
          </motion.div>
          
          <motion.div 
            className="stats-value mb-2"
            variants={valueVariants}
          >
            {value}
          </motion.div>
          
          <motion.div 
            className="stats-label mb-2"
            variants={valueVariants}
          >
            {title}
          </motion.div>
          
          {subtitle && (
            <motion.div 
              className="text-muted small mb-3"
              variants={valueVariants}
            >
              {subtitle}
            </motion.div>
          )}
          
          {trend && (
            <motion.div 
              className={`${getTrendColor()} d-flex align-items-center justify-content-center`}
              variants={valueVariants}
            >
              <span className="me-1">{getTrendIcon()}</span>
              <small className="fw-bold">{trendValue}</small>
            </motion.div>
          )}
        </Card.Body>
      </Card>
    </motion.div>
  );
}

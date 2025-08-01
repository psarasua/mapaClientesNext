'use client';

import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { Card } from 'react-bootstrap';

export default function AnimatedCard({ children, className = '', delay = 0 }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const variants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: delay,
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
      <Card className={className}>
        {children}
      </Card>
    </motion.div>
  );
} 
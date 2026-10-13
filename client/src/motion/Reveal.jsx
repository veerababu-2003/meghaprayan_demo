import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const Reveal = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  className = '',
  cascade = false
}) => {
  const shouldReduceMotion = useReducedMotion();

  const getOffsets = () => {
    if (shouldReduceMotion) return { x: 0, y: 0 };
    switch (direction) {
      case 'up': return { x: 0, y: 28 };
      case 'down': return { x: 0, y: -28 };
      case 'left': return { x: 28, y: 0 };
      case 'right': return { x: -28, y: 0 };
      default: return { x: 0, y: 28 };
    }
  };

  const { x, y } = getOffsets();

  return (
    <motion.div
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: shouldReduceMotion ? 0.2 : duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;

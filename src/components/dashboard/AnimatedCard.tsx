import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  onClick?: () => void;
  hoverScale?: number;
}

export default function AnimatedCard({ 
  children, 
  delay = 0, 
  className = '', 
  onClick,
  hoverScale = 1.02 
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        scale: hoverScale,
        transition: { duration: 0.2 }
      }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

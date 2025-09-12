import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-card text-card-foreground border border-border rounded-lg shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export default Card;
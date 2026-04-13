import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  // FIX: Added onClick prop to allow Card component to be clickable.
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div onClick={onClick} className={`bg-card text-card-foreground border border-border rounded-lg shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export default Card;

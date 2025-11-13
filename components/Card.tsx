import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div onClick={onClick} className={`bg-card text-card-foreground border border-border/50 rounded-xl shadow-lg dark:shadow-black/25 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
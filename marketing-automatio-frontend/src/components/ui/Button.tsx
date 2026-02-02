import type { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  onClick 
}: ButtonProps) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg',
    secondary: 'bg-white text-primary-600 hover:bg-gray-50 shadow-md hover:shadow-lg',
    outline: 'border-2 border-white text-white hover:bg-white hover:text-primary-600',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

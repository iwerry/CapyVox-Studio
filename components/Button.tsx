import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = "relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-bold transition-all duration-300 rounded-lg group focus:outline-none focus:ring";
  
  const variants = {
    primary: "bg-gradient-to-br from-neon-blue to-blue-600 text-white hover:from-blue-600 hover:to-neon-blue shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_30px_rgba(0,243,255,0.5)]",
    secondary: "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:border-slate-500",
    accent: "bg-gradient-to-br from-fuchsia-500 to-neon-purple text-white hover:from-neon-purple hover:to-fuchsia-500 shadow-[0_0_20px_rgba(188,19,254,0.3)] hover:shadow-[0_0_30px_rgba(188,19,254,0.5)]",
    danger: "bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20",
  };

  const loadingSpinner = (
    <svg className="w-5 h-5 mr-3 animate-spin" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? loadingSpinner : (icon && <span className="mr-2">{icon}</span>)}
      {children}
    </button>
  );
};

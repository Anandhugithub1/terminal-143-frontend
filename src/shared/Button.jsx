import React from 'react';
import { Link } from 'react-router-dom';
export const Button = ({
  children,
  onClick,
  disabled,
  type = 'button',
  className = '',
  textColor = 'text-white',
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 px-4 rounded-3xl transition-opacity font-medium shadow-lg bg-primary ${textColor} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};



export const GoogleButton = ({ onClick,disabled, type = 'button',...props  
}) => {
  return (
 
    <button
    type={type}
    onClick={onClick}
    className="w-full mt-4 flex items-center justify-center gap-2 bg-white border border-border-clr text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors"
  disabled={disabled} {...props}> 
    <img
      src="https://www.svgrepo.com/show/475656/google-color.svg"
      alt="Google logo"
      className="w-5 h-5"
    />
    <span className="text-sm">Google</span>
  </button>
  );
}

export const baseButtonClasses =
  "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-105 active:scale-95";
export const PrimaryButton = ({ children, to, className = "", ...props }) => (
  <Link
    to={to}
    className={`${baseButtonClasses} bg-gradient-to-r from-gradient-primary to-gradient-secondary text-white px-6 py-4 hover:shadow-xl ${className}`}
    {...props}
  >
    {children}
  </Link>
);

export const SecondaryButton = ({ children, to, className = "", ...props }) => (
  <Link
    to={to}
    className={`${baseButtonClasses}  rounded-3xl border-gray-200 bg-white text-gray-700 hover:border-indigo-100 hover:bg-indigo-50 px-6 py-4 ${className}`}
    {...props}
  >
    {children}
  </Link>
);


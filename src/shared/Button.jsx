import React from 'react';

export const Button = ({
  children,
  onClick,
  disabled,
  type = 'button',
  className = '',
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 px-4 rounded-xl transition-opacity shadow-lg bg-gradient-to-r from-gradient-primary to-gradient-secondary text-white ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:opacity-90'
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

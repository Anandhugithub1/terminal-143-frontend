import { memo } from 'react';
import { AiFillHome, AiOutlineSearch, AiOutlineMessage, AiOutlineHeart, AiOutlineUser } from 'react-icons/ai';
import React, { forwardRef } from 'react';


export const InputField = forwardRef(
  (
    {
      type = 'text',
      value,
      onChange,
      placeholder,
      className = '',
      name,
      autoComplete,
      ...rest
    },
    ref
  ) => {
    return (
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}

        /*  Accessibility */
        aria-label={placeholder || name || 'input field'}

        /*  Autofill + mobile UX */
        name={name}
        autoComplete={autoComplete}

        className={`w-full px-4 py-3 rounded-xl border border-border-clr
        focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent
        ${className}`}
        
        {...rest}
      />
    );
  }
);




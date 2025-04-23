import React from 'react';
import { memo } from 'react';
import { AiFillHome, AiOutlineSearch, AiOutlineMessage, AiOutlineHeart, AiOutlineUser } from 'react-icons/ai';

export const InputField = ({ type = 'text', value, onChange, placeholder, inputProps = {} }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...inputProps}
      className="w-full px-4 py-3 rounded-xl border border-border-clr focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent"
      required
    />
  );
};




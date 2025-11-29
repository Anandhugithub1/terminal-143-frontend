import React from "react";
import PropTypes from "prop-types";

/**
 * small icon button used for clear/other tiny actions
 * accepts any react node as children (typically an icon)
 */
export default function IconButton({ onClick, children, ariaLabel = "", className = "", disabled = false }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 hover:bg-gray-100 rounded-full transition ${className}`}
    >
      {children}
    </button>
  );
}

IconButton.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  ariaLabel: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

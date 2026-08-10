import React from "react";

export default function Spinner({ size = 5, className = "" }) {
  return (
    <div
      role="status"
      aria-label="loading"
      className={`border-2 rounded-full animate-spin ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderColor: "rgb(219 39 119)",
        borderTopColor: "transparent",
      }}
    />
  );
}

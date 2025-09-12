import React from 'react';
import './styles.css';

/**
 * A component to display success or error messages.
 * @param {{ message: string, type: 'success' | 'error' }} props
 */
function Alert({ message, type }) {
  if (!message) {
    return null;
  }

  const alertTypeClass = `alert-${type}`;

  return (
    <div className={`alert ${alertTypeClass}`}>
      <p>{message}</p>
    </div>
  );
}

export default Alert;

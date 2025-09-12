import React, { useEffect, useState } from 'react';
import { FiX, FiInfo, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import './styles.css';

const icons = {
  success: <FiCheckCircle />,
  error: <FiAlertTriangle />,
  info: <FiInfo />,
};

const Toast = ({ message, type = 'info', onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // This is to ensure the exit animation can play before the component is removed.
    // The actual removal is handled by the timer in the context.
    // This effect is more for when the user clicks the close button.
    return () => {
      // Cleanup if needed
    };
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    // Let the exit animation play before calling onClose
    setTimeout(onClose, 300); // Duration of exit animation
  };

  const Icon = icons[type];
  const toastClass = `toast toast-${type} ${isExiting ? 'exit' : 'enter'}`;

  return (
    <div className={toastClass}>
      <div className="toast-icon">{Icon}</div>
      <p className="toast-message">{message}</p>
      <button onClick={handleClose} className="toast-close-btn">
        <FiX />
      </button>
    </div>
  );
};

export default Toast;

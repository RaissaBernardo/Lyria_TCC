import React from 'react';
import './styles.css';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal-content">
        <h3>{title || 'Confirmar Ação'}</h3>
        <p>{message || 'Você tem certeza?'}</p>
        <div className="confirmation-modal-actions">
          <button onClick={onClose} className="btn-cancel">
            Cancelar
          </button>
          <button onClick={onConfirm} className="btn-confirm">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

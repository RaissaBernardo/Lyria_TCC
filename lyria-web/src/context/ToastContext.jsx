import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; 

if (typeof crypto?.randomUUID !== 'function') {
  console.log('crypto.randomUUID não encontrado, usando polyfill...');

  crypto.randomUUID = () => uuidv4();
}


const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 10000) => {

    let id;
    if (typeof crypto?.randomUUID === 'function') {
      id = crypto.randomUUID(); 
    } else {
      id = uuidv4();  
    }
    console.log('ID gerado para o toast:', id); 

    setToasts(prevToasts => [...prevToasts, { id, message, type }]);

    if (duration) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toasts }}>
      {children}
    </ToastContext.Provider>
  );
};

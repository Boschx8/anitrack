// ToastProvider.jsx
// Aquest component permet mostrar notificacions temporals a l'aplicació

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

// Component Toast que mostra una notificació individual
const Toast = ({ message, type, onClose }) => {
  // Efecte per fer desaparèixer la notificació després de 3 segons
  useEffect(() => {
    // Crear un temporitzador
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    // Netejar el temporitzador quan es desmunta el component
    return () => clearTimeout(timer);
  }, [onClose]);

  // Renderitzem la notificació
  return (
    <div className={`toast ${type}`}>
      <div className="toast-content">
        {/* Icona segons el tipus de notificació */}
        <div className="toast-icon">
          {type === 'success' ? (
            <CheckCircle2 size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
        </div>
        {/* Contingut de la notificació */}
        <div className="toast-message">
          <p className="toast-title">{type === 'success' ? 'Success' : 'Error'}</p>
          <p className="toast-description">{message}</p>
        </div>
        {/* Botó per tancar la notificació */}
        <button className="toast-close" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Component principal que gestiona totes les notificacions
const ToastProvider = ({ children }) => {
  // Estat per guardar les notificacions actives
  const [toasts, setToasts] = useState([]);

  // Funció per mostrar una nova notificació
  const showToast = (message, type = 'success') => {
    // Creem un ID únic basat en la data actual
    const id = Date.now();
    // Afegim la nova notificació a la llista
    setToasts(prev => [...prev, { id, message, type }]);
  };

  // Funció per eliminar una notificació
  const removeToast = (id) => {
    // Filtrem la notificació amb l'ID especificat
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Renderitzem el component
  return (
    <>
      {/* Passem la funció showToast als fills */}
      {children({ showToast })}
      {/* Contenidor per mostrar totes les notificacions */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </>
  );
};

export default ToastProvider;
import React from 'react';
import { useShop } from '../context/ShopContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useShop();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container-custom">
      {toasts.map(toast => {
        let Icon = Info;
        let title = 'Notification';
        if (toast.type === 'success') {
          Icon = CheckCircle2;
          title = 'Success';
        } else if (toast.type === 'danger') {
          Icon = AlertTriangle;
          title = 'Alert';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          title = 'Warning';
        }

        return (
          <div key={toast.id} className={`custom-toast ${toast.type}`}>
            <Icon size={22} className="flex-shrink-0" />
            <div className="flex-grow-1">
              <h6 className="toast-msg-title">{title}</h6>
              <p className="toast-msg-body">{toast.message}</p>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-link text-muted p-0 ms-2"
              onClick={() => removeToast(toast.id)}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}


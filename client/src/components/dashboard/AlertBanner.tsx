import { useState } from "react";

interface AlertBannerProps {
  title: string;
  message: string;
  type?: 'warning' | 'danger' | 'info';
  onDismiss?: () => void;
}

export default function AlertBanner({ 
  title, 
  message, 
  type = 'warning',
  onDismiss
}: AlertBannerProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
  };

  const getAlertStyles = () => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-red-50',
          border: 'border-red-400',
          icon: 'ri-alert-line text-red-400',
          titleColor: 'text-red-800',
          textColor: 'text-red-700',
          buttonColor: 'text-red-500 hover:bg-red-100'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-400',
          icon: 'ri-information-line text-blue-400',
          titleColor: 'text-blue-800',
          textColor: 'text-blue-700',
          buttonColor: 'text-blue-500 hover:bg-blue-100'
        };
      default:
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-400',
          icon: 'ri-alert-line text-yellow-400',
          titleColor: 'text-yellow-800',
          textColor: 'text-yellow-700',
          buttonColor: 'text-yellow-500 hover:bg-yellow-100'
        };
    }
  };

  const styles = getAlertStyles();

  return (
    <div className={`${styles.bg} border-l-4 ${styles.border} p-4 mb-6 rounded-md flex items-start`}>
      <div className="flex-shrink-0">
        <i className={`${styles.icon} text-xl`}></i>
      </div>
      <div className="ml-3">
        <h3 className={`text-sm font-medium ${styles.titleColor}`}>
          {title}
        </h3>
        <div className={`mt-1 text-sm ${styles.textColor}`}>
          <p>{message}</p>
        </div>
        <div className="mt-2">
          <button type="button" className={`text-sm font-medium ${styles.titleColor} hover:${styles.textColor}`}>
            View details <i className="ri-arrow-right-line text-xs ml-1"></i>
          </button>
        </div>
      </div>
      <div className="ml-auto pl-3">
        <div className="-mx-1.5 -my-1.5">
          <button 
            type="button" 
            onClick={handleDismiss}
            className={`inline-flex rounded-md p-1.5 ${styles.buttonColor}`}
          >
            <span className="sr-only">Dismiss</span>
            <i className="ri-close-line"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

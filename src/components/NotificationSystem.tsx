import { useEffect, useState } from 'react';
import { Check, ShoppingCart, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export const NotificationSystem = ({ notifications, onRemove }: NotificationSystemProps) => {
  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.duration) {
        const timer = setTimeout(() => {
          onRemove(notification.id);
        }, notification.duration);
        return () => clearTimeout(timer);
      }
    });
  }, [notifications, onRemove]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`animate-slide-in-right max-w-sm p-4 rounded-lg shadow-lg backdrop-blur-sm border ${
            notification.type === 'success'
              ? 'bg-green-500/90 text-white border-green-400'
              : notification.type === 'error'
              ? 'bg-red-500/90 text-white border-red-400'
              : 'bg-blue-500/90 text-white border-blue-400'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {notification.type === 'success' && <Check className="w-5 h-5" />}
              {notification.type === 'error' && <X className="w-5 h-5" />}
              {notification.type === 'info' && <ShoppingCart className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{notification.title}</p>
              {notification.message && (
                <p className="text-sm opacity-90 mt-1">{notification.message}</p>
              )}
            </div>
            <button
              onClick={() => onRemove(notification.id)}
              className="flex-shrink-0 p-1 rounded hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Global notification store
let globalNotifications: Notification[] = [];
let globalListeners: ((notifications: Notification[]) => void)[] = [];

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const listener = (newNotifications: Notification[]) => {
      setNotifications(newNotifications);
    };
    
    globalListeners.push(listener);
    setNotifications(globalNotifications);
    
    return () => {
      globalListeners = globalListeners.filter(l => l !== listener);
    };
  }, []);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = `${Date.now()}-${Math.random()}`;
    const newNotification = { ...notification, id };
    globalNotifications = [...globalNotifications, newNotification];
    globalListeners.forEach(listener => listener(globalNotifications));
    
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 3000);
    }
  };

  const removeNotification = (id: string) => {
    globalNotifications = globalNotifications.filter(n => n.id !== id);
    globalListeners.forEach(listener => listener(globalNotifications));
  };

  const clearNotifications = () => {
    globalNotifications = [];
    globalListeners.forEach(listener => listener(globalNotifications));
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications
  };
};

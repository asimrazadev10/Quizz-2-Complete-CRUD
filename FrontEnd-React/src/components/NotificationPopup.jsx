import React, { useEffect, useState } from "react";
import { X, Bell, DollarSign, AlertCircle } from "lucide-react";

const NotificationPopup = ({ notification, onClose, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10);
    
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onDismiss) onDismiss();
      if (onClose) onClose();
    }, 300);
  };

  if (!notification) return null;

  const getNotificationIcon = () => {
    if (notification.type === 'budget') {
      return <DollarSign className="w-5 h-5" />;
    }
    return <Bell className="w-5 h-5" />;
  };

  const getNotificationColor = () => {
    if (notification.severity === 'high' || notification.isUrgent) {
      return 'bg-red-500/20 border-red-500/50';
    }
    if (notification.severity === 'medium') {
      return 'bg-orange-500/20 border-orange-500/50';
    }
    return 'bg-purple-600/20 border-purple-600/50';
  };

  return (
    <div
      className={`fixed top-20 right-4 z-50 max-w-sm w-full transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
    >
      <div className={`${getNotificationColor()} rounded-xl p-4 border shadow-lg backdrop-blur-xl`}>
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
            notification.severity === 'high' || notification.isUrgent
              ? 'bg-red-500/20 text-red-400'
              : notification.severity === 'medium'
              ? 'bg-orange-500/20 text-orange-400'
              : 'bg-purple-600/20 text-purple-400'
          }`}>
            {getNotificationIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-white mb-1">
                  {notification.title || 'New Alert'}
                </p>
                <p className="text-xs text-gray-300 line-clamp-2">
                  {notification.message || notification.description}
                </p>
                {notification.timestamp && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
              <button
                onClick={handleDismiss}
                className="ml-2 flex-shrink-0 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;


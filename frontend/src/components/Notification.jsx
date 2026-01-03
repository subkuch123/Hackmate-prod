// components/Notification.jsx
import { useState, useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon, BellAlertIcon } from '@heroicons/react/24/outline';

const Notification = ({ 
  notification = {},
  onClose,
  onAction 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Destructure with defaults
  const {
    _id,
    title = "Notification",
    message = "",
    description = "",
    position = "STICKY_TOP",
    duration = { type: "FIXED", timer: 5000 },
    type = "OTHER",
    priority = "MEDIUM",
    action = { type: "NONE" },
    isBroadcast = false,
    createdAt = new Date()
  } = notification;

  // Auto-show notification
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss for fixed duration notifications
  useEffect(() => {
    if (duration.type === "FIXED" && duration.timer > 0 && isVisible) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration.timer);

      return () => clearTimeout(timer);
    }
  }, [duration, isVisible]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose(notification);
    }, 300);
  };

  const handleAction = () => {
    if (onAction) onAction(notification);
    
    // Handle different action types
    switch (action.type) {
      case "REDIRECT":
        if (action.url) window.location.href = action.url;
        break;
      case "EXTERNAL_LINK":
        if (action.url) window.open(action.url, '_blank');
        break;
      case "MODAL":
        // You would handle modal opening here
        console.log("Open modal with data:", action.payload);
        break;
      case "API_CALL":
        // You would handle API call here
        console.log("Make API call:", action);
        break;
      default:
        break;
    }
    
    handleClose();
  };

  // Get icon based on type and priority
  const getNotificationIcon = () => {
    switch (type) {
      case "SYSTEM_ALERT":
      case "SECURITY":
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />;
      case "ADMIN_ALERT":
      case "URGENT":
        return <BellAlertIcon className="w-5 h-5 text-yellow-400" />;
      case "HACKATHON":
      case "ANNOUNCEMENT":
        return <InformationCircleIcon className="w-5 h-5 text-blue-400" />;
      case "MESSAGE":
      case "REMINDER":
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-purple-400" />;
    }
  };

  // Get priority-based styling
  const getPriorityStyles = () => {
    switch (priority) {
      case "URGENT":
        return "border-l-4 border-red-500 animate-pulse-glow";
      case "HIGH":
        return "border-l-4 border-orange-500";
      case "MEDIUM":
        return "border-l-4 border-yellow-500";
      case "LOW":
        return "border-l-4 border-green-500";
      default:
        return "border-l-4 border-gray-500";
    }
  };

  // Get type-based styling
  const getTypeStyles = () => {
    switch (type) {
      case "SYSTEM_ALERT":
      case "SECURITY":
        return "bg-red-500/10";
      case "ADMIN_ALERT":
        return "bg-purple-500/10";
      case "HACKATHON":
        return "bg-cyan-500/10";
      case "ANNOUNCEMENT":
        return "bg-blue-500/10";
      default:
        return "bg-gray-500/10";
    }
  };

  // Format timestamp
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Notification content component
  const NotificationContent = () => (
    <div className={`
      glass-card p-4 mb-3 transition-all duration-300 transform
      ${isVisible && !isExiting ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}
      ${getPriorityStyles()}
      ${getTypeStyles()}
      neon-glow-hover
    `}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0 mt-0.5">
            {getNotificationIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-sm font-orbitron font-semibold text-foreground truncate">
                {title}
              </h3>
              {isBroadcast && (
                <span className="px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-300 rounded-full font-exo">
                  Broadcast
                </span>
              )}
              {priority === "URGENT" && (
                <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-300 rounded-full font-exo animate-pulse">
                  URGENT
                </span>
              )}
            </div>
            
            <p className="text-sm text-foreground/90 font-exo mb-1">
              {message}
            </p>
            
            {description && (
              <p className="text-xs text-muted-foreground font-exo mb-2">
                {description}
              </p>
            )}
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground font-exo">
                {formatTime(createdAt)}
              </span>
              
              {action.type !== "NONE" && (
                <button
                  onClick={handleAction}
                  className="text-xs font-orbitron text-primary hover:text-cyan-300 transition-colors duration-200 px-2 py-1 rounded bg-primary/10 hover:bg-primary/20"
                >
                  {action.type === "REDIRECT" && "View"}
                  {action.type === "EXTERNAL_LINK" && "Open"}
                  {action.type === "MODAL" && "Details"}
                  {action.type === "API_CALL" && "Action"}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {duration.type !== "INFINITE" && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-3 p-1 rounded-full hover:bg-white/10 transition-colors duration-200"
          >
            <XMarkIcon className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
      
      {/* Progress bar for fixed duration notifications */}
      {duration.type === "FIXED" && duration.timer > 0 && (
        <div className="w-full h-1 bg-gray-600/30 rounded-full mt-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-100 ease-linear"
            style={{ 
              width: isVisible && !isExiting ? '100%' : '0%',
              transition: `width ${duration.timer}ms linear`
            }}
          />
        </div>
      )}
    </div>
  );

  // Render based on position
  switch (position) {
    case "STICKY_TOP":
      return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
          <NotificationContent />
        </div>
      );
      
    case "WHOLE_PAGE":
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md">
            <NotificationContent />
          </div>
        </div>
      );
      
    case "SIDE_BOTTOM_RIGHT":
      return (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm">
          <NotificationContent />
        </div>
      );
      
    default:
      return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
          <NotificationContent />
        </div>
      );
  }
};

export default Notification;
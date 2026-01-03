import { useState, useEffect } from "react";
import type { FC, ComponentType, SVGProps } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  X,
  Bell,
  ShieldAlert,
} from "lucide-react";
import { Link } from "react-router-dom";
import { API_URL } from "@/config/API_URL";
import ShuffleToText from "../Effects/ShuffleText";

// ---- Types matching your schema ---- //

export type NotificationType =
  | "SYSTEM_ALERT"
  | "ADMIN_ALERT"
  | "USER_SPECIFIC"
  | "TEAM"
  | "HACKATHON"
  | "MESSAGE"
  | "SECURITY"
  | "ANNOUNCEMENT"
  | "REMINDER"
  | "OTHER";

export interface NotificationDTO {
  title: string;
  message: string;
  description?: string;
  duration?: number;
  type: NotificationType | string;
  status?: string;
}

interface NotificationStatusBarProps {
  notification: NotificationDTO;
  /**
   * Optional: force auto-hide on/off from frontend.
   * If not provided, we respect notification.duration.type:
   * - INFINITE  -> no auto hide
   * - FIXED     -> auto hide after duration.timer or fallback
   */
  autoHideOverride?: boolean;
  /**
   * Fallback duration (ms) if notification.duration.timer is not provided.
   */
  defaultAutoHideDuration?: number;
  onClose?: () => void;
  onVisibilityChange?: (isVisible: boolean) => void;
}

const typeConfig: Record<
  NotificationType,
  {
    label: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    containerClass: string;
    iconClass: string;
  }
> = {
  SYSTEM_ALERT: {
    label: "System Alert",
    icon: AlertCircle,
    containerClass:
      "bg-red-500/10 border-red-500/30 text-red-50 dark:text-red-100",
    iconClass: "text-red-400",
  },
  ADMIN_ALERT: {
    label: "Admin Alert",
    icon: ShieldAlert,
    containerClass:
      "bg-amber-500/10 border-amber-500/30 text-amber-50 dark:text-amber-100",
    iconClass: "text-amber-400",
  },
  USER_SPECIFIC: {
    label: "Personal Notification",
    icon: Bell,
    containerClass:
      "bg-sky-500/10 border-sky-500/30 text-sky-50 dark:text-sky-100",
    iconClass: "text-sky-400",
  },
  TEAM: {
    label: "Team Update",
    icon: Bell,
    containerClass:
      "bg-indigo-500/10 border-indigo-500/30 text-indigo-50 dark:text-indigo-100",
    iconClass: "text-indigo-400",
  },
  HACKATHON: {
    label: "Hackathon Update",
    icon: CheckCircle,
    containerClass:
      "bg-purple-500/10 border-purple-500/30 text-purple-50 dark:text-purple-100",
    iconClass: "text-purple-400",
  },
  MESSAGE: {
    label: "New Message",
    icon: Bell,
    containerClass:
      "bg-emerald-500/10 border-emerald-500/30 text-emerald-50 dark:text-emerald-100",
    iconClass: "text-emerald-400",
  },
  SECURITY: {
    label: "Security Alert",
    icon: ShieldAlert,
    containerClass:
      "bg-red-500/10 border-red-500/30 text-red-50 dark:text-red-100",
    iconClass: "text-red-400",
  },
  ANNOUNCEMENT: {
    label: "Announcement",
    icon: Bell,
    containerClass:
      "bg-blue-500/10 border-blue-500/30 text-blue-50 dark:text-blue-100",
    iconClass: "text-blue-400",
  },
  REMINDER: {
    label: "Reminder",
    icon: Bell,
    containerClass:
      "bg-amber-500/10 border-amber-500/30 text-amber-50 dark:text-amber-100",
    iconClass: "text-amber-400",
  },
  OTHER: {
    label: "Notification",
    icon: AlertCircle,
    containerClass:
      "bg-zinc-800/80 border-zinc-700 text-zinc-50 dark:text-zinc-100",
    iconClass: "text-zinc-200",
  },
};

const NotificationStatusBar: FC<NotificationStatusBarProps> = ({
  notification,
  autoHideOverride,
  defaultAutoHideDuration = 4000,
  onClose,
  onVisibilityChange,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const { title, message, description, duration, type, status, action } =
    notification;

  const config = typeConfig[type as NotificationType] ?? typeConfig.OTHER;
  const StatusIcon = config.icon;

  const resolvedAutoHide =
    autoHideOverride !== undefined ? autoHideOverride : true;
  const resolvedDuration =
    duration && duration > 0 ? duration : defaultAutoHideDuration;

  useEffect(() => {
    if (!isVisible) return;
    if (!resolvedAutoHide) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, resolvedDuration);

    return () => clearTimeout(timer);
  }, [resolvedAutoHide, resolvedDuration, onClose, isVisible]);

  // Notify parent component about visibility changes
  useEffect(() => {
    onVisibilityChange?.(isVisible);
  }, [isVisible, onVisibilityChange]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  // Don't show if status is INACTIVE
  if (status === "INACTIVE") {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 28,
          }}
          className={`fixed top-0 left-0 right-0 z-[60] ${config.containerClass} border-b backdrop-blur-md`}
        >
          <div className="px-4 py-2">
            {/* Desktop View - Full Content */}
            <div className="hidden md:flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div>
                  <StatusIcon className={`w-4 h-4 ${config.iconClass}`} />
                </div>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <h2 className="font-orbitron text-sm whitespace-nowrap">
                      {title}
                    </h2>

                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <p className="text-xs opacity-90 whitespace-nowrap truncate flex-1">
                        {message}
                      </p>

                      {description && (
                        <p className="text-[10px] opacity-80 whitespace-nowrap truncate max-w-[150px]">
                          {action?.type === "REDIRECT" ? (
                            <Link
                              to={`${action.url}`}
                              target="_self"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              <ShuffleToText
                                fromText={description}
                                toText={
                                  action?.url?.includes("hackathon")
                                    ? "See Details 👉 CodeYudh"
                                    : description
                                }
                                autoStart={false}
                                className="underline"
                              />
                            </Link>
                          ) : (
                            description
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-6 w-6 p-0 hover:bg-white/20 rounded-full"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Mobile View - Only Title */}
            <div className="md:hidden flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div>
                  <StatusIcon className={`w-4 h-4 ${config.iconClass}`} />
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <h2 className="font-orbitron text-sm whitespace-nowrap truncate flex-1">
                    {title}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-6 w-6 p-0 hover:bg-white/20 rounded-full"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationStatusBar;

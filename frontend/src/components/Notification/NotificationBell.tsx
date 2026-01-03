import { useState } from "react";
import {
  Bell,
  X,
  CheckCheck,
  Gamepad2,
  Trophy,
  MessageSquare,
  Gift,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "../ui/glass-card";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "achievement" | "message" | "reward" | "system" | "friend";
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Achievement Unlocked!",
    message: "You've reached Level 50!",
    time: "2m ago",
    read: false,
    type: "achievement",
  },
  {
    id: "2",
    title: "New Message",
    message: "CyberNinja420 sent you a message",
    time: "15m ago",
    read: false,
    type: "message",
  },
  {
    id: "3",
    title: "Daily Reward Ready",
    message: "Claim your 500 XP bonus now!",
    time: "1h ago",
    read: false,
    type: "reward",
  },
  {
    id: "4",
    title: "Friend Online",
    message: "PixelWarrior is now playing",
    time: "2h ago",
    read: true,
    type: "friend",
  },
  {
    id: "5",
    title: "System Update",
    message: "New features available!",
    time: "5h ago",
    read: true,
    type: "system",
  },
];

const getIcon = (type: Notification["type"]) => {
  switch (type) {
    case "achievement":
      return <Trophy className="h-4 w-4 text-neon-orange" />;
    case "message":
      return <MessageSquare className="h-4 w-4 text-neon-cyan" />;
    case "reward":
      return <Gift className="h-4 w-4 text-neon-pink" />;
    case "friend":
      return <Gamepad2 className="h-4 w-4 text-neon-green" />;
    case "system":
      return <Zap className="h-4 w-4 text-neon-purple" />;
  }
};

export const BellNotification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isAnimating, setIsAnimating] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleBellClick = () => {
    setIsAnimating(true);
    setIsOpen(!isOpen);
    setTimeout(() => setIsAnimating(false), 1000);
  };

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  return (
    <div className="relative">
      <button
        onClick={handleBellClick}
        className={cn(
          "relative p-3 rounded-lg border border-border bg-card transition-all duration-300",
          "hover:neon-border-purple",
          isAnimating && "animate-bell-ring"
        )}
      >
        <Bell className="h-6 w-6 text-primary" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground animate-pulse-glow">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <GlassCard className="absolute right-0 top-14 w-80 rounded-lg border border-border shadow-2xl animate-scale-in z-50 neon-border-purple">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h3 className="font-display text-lg font-bold text-primary neon-text-purple">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-secondary transition-colors"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="mx-auto h-12 w-12 opacity-50 mb-2" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 p-4 border-b border-border last:border-0 transition-all duration-200 hover:bg-muted/30",
                    !notification.read && "bg-primary/5",
                    "animate-slide-in-right"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="mt-1">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "font-semibold text-sm",
                          !notification.read && "text-foreground"
                        )}
                      >
                        {notification.title}
                      </p>
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {notification.message}
                    </p>
                    <p className="text-xs text-secondary mt-1">
                      {notification.time}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-accent animate-pulse shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="border-t border-border p-3">
            <button className="w-full py-2 text-center text-sm font-semibold text-primary hover:text-secondary transition-colors">
              View All Notifications
            </button>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

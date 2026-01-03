import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ProfileDropdown } from "./profile-dropdown";
import { Menu, X, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "@/hooks/authHook";
import HackMateLogo from "@/assets/logoRemove.png";
import NotificationStatusBar from "@/components/Notification/NotificationStatusBar";
import { api } from "@/service/api";
import { API_URL } from "@/config/API_URL";
import { set } from "date-fns";
import { BellNotification } from "../Notification/NotificationBell";

const navItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Lobbies", path: "/lobbies" },
  { name: "Teams", path: "/teams" },
  { name: "Donation", path: "/donation" },
];

const publicNavItems = [
  // { name: 'Home', path: '/' }, // Removed Home button
];

interface NotificationDTO {
  title: string;
  message: string;
  description?: string;
  duration?: number;
  type: string;
  status?: string;
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user } = useUser();
  const [notificationHeight, setNotificationHeight] = useState(0);
  const [notificationFromServer, setNotificationFromServer] =
    useState<NotificationDTO | null>(null);

  const currentNavItems = isAuthenticated ? navItems : publicNavItems;

  // Update body padding based on notification height
  useEffect(() => {
    document.body.style.paddingTop = `${72 + notificationHeight}px`;
    document.body.style.transition = "padding-top 0.3s ease";

    return () => {
      document.body.style.paddingTop = "0";
    };
  }, [notificationHeight]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get(
          `${API_URL}/api/admin/notifications/userNotification`
        );
        const notificationData = response.data.data;

        // Only set notification if status is ACTIVE
        if (notificationData.status === "ACTIVE") {
          setNotificationFromServer(notificationData);
          setNotificationHeight(48);
        } else {
          setNotificationFromServer(null);
          setNotificationHeight(0);
        }
      } catch (error) {
        // Handle 401 specifically
        if (error) {
          setNotificationFromServer({
            title: "Server Error",
            message:
              "Failed to receive update from server. Please try again later.",
            type: "SYSTEM_ALERT",
            status: "ACTIVE",
            duration: 60000000,
          });
          setNotificationHeight(48);
        } else {
          setNotificationHeight(0);
        }
      }
    };

    fetchNotifications(); // Initial fetch

    const interval = setInterval(fetchNotifications, 60000); // Fetch every 60 seconds

    return () => clearInterval(interval);
  }, []);

  const handleNotificationClose = () => {
    console.log("Notification closed");
    setNotificationHeight(0);
    setNotificationFromServer(null);
  };

  const handleNotificationShow = (isVisible: boolean) => {
    //setNotificationHeight(isVisible ? 48 : 0);
  };

  return (
    <>
      {notificationFromServer && (
        <NotificationStatusBar
          notification={notificationFromServer}
          autoHideOverride={true}
          onClose={handleNotificationClose}
          onVisibilityChange={handleNotificationShow}
        />
      )}

      {/* Main Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 ${
          isOpen ? "bg-background/95 backdrop-blur-md" : "backdrop-blur-sm"
        } border-border/50 transition-all duration-300`}
        style={{
           top: `${notificationHeight}px`,
          marginTop: notificationHeight > 0 ? '-10px' : '0'
        }}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between p-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={HackMateLogo}
              className="
              w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-10 lg:h-10
              group-hover:scale-110 transition-transform duration-300
              slow-spin
              drop-shadow-[0_0_8px_rgb(34,211,238)]
            "
              alt="HackMate Logo"
            />

            <span
              className="
      font-semibold text-lg sm:text-xl md:text-2xl lg:text-3xl
      text-foreground group-hover:text-primary transition-colors
    "
            >
              HackMate
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {currentNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 rounded-lg transition-all duration-300 ${
                  location.pathname === item.path
                    ? "text-primary bg-primary/10 shadow-glow"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                {item.name}
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <Button variant="ghost" size="icon" className="relative">
                  {/* <Bell className="h-5 w-5" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse">
                    <div className="absolute inset-0 bg-destructive rounded-full animate-ping"></div>
                  </div> */}
                  <BellNotification />
                </Button>

                <ProfileDropdown />
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="hero" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden absolute left-0 right-0 top-full"
              transition={{ duration: 0.3 }}
            >
              <div className="max-w-7xl bg-background/95 backdrop-blur-md border-border/50 rounded-lg p-6 space-y-4 mx-4">
                {currentNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-lg transition-all duration-300 ${
                      location.pathname === item.path
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="flex items-center justify-end w-full gap-3 lg:pt-4 border-t border-glass-border">
                  {isAuthenticated ? (
                    <>
                      <div className="lg:mt-2">
                        <ProfileDropdown setIsOpen2={setIsOpen} />
                      </div>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full">
                          Login In
                        </Button>
                      </Link>
                      <Link to="/signup" onClick={() => setIsOpen(false)}>
                        <Button variant="hero" className="w-full">
                          Sign Up
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}

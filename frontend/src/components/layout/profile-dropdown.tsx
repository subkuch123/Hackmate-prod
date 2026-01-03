import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { useUser } from "@/hooks/authHook";
import { logoutUser } from "@/store/slices/authSlice";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Crown, LogOut, Mail, Settings, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { showSuccess } from "../ui/ToasterMsg";

export function ProfileDropdown({
  setIsOpen2,
}: {
  setIsOpen2?: (open: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, dispatch } = useUser();
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (
        wrapperRef.current &&
        target &&
        !wrapperRef.current.contains(target)
      ) {
        closeAll();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen2]);

  const closeAll = () => {
    setIsOpen(false);
    setIsOpen2?.(false);
  };

  const handleLogout = () => {
    closeAll();
    dispatch(logoutUser());
    showSuccess("Logout Successfully", "Auth", 4000);
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Profile Trigger */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/20"
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <img
              src={user.profilePicture}
              alt="Profile"
              className="w-7 h-7 rounded-full ring-2 ring-primary/30"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-background" />
          </div>

          <div className="text-left max-w-28 hidden sm:block">
            <div className="font-medium text-foreground text-sm truncate">
              {user.name}
            </div>
            <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
              <Crown className="w-3 h-3 text-yellow-500" />
              {user.role}
            </div>
          </div>
        </div>

        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : "text-muted-foreground"
          }`}
        />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-64 z-50"
          >
            <GlassCard className="p-0 shadow-xl backdrop-blur-xl bg-background/95 border">
              {/* Header */}
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-10 h-10 rounded-xl ring-2 ring-primary/20"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-background" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground text-sm truncate">
                      {user.name}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Crown className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-muted-foreground">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>

              {/* Menu Items */}
              <nav className="p-2 space-y-1">
                <Link
                  to="/profile"
                  onClick={closeAll}
                  className="flex items-center gap-3 p-2 rounded-lg text-foreground hover:bg-primary/5 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20">
                    <User className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Profile</div>
                    <div className="text-xs text-muted-foreground">
                      Personal info
                    </div>
                  </div>
                </Link>

                <Link
                  to="/settings"
                  onClick={closeAll}
                  className="flex items-center gap-3 p-2 rounded-lg text-foreground hover:bg-primary/5 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20">
                    <Settings className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Settings</div>
                    <div className="text-xs text-muted-foreground">
                      Preferences
                    </div>
                  </div>
                </Link>

                <div className="border-t my-2" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20">
                    <LogOut className="w-4 h-4 text-destructive" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Logout</div>
                    <div className="text-xs text-muted-foreground">
                      Sign out
                    </div>
                  </div>
                </button>
              </nav>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

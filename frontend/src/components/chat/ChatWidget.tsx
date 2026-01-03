import { useEffect, useState } from "react";
import { MessageCircle, X, Bot, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";
import ChatInterface from "./ChatInterface";
import useIsMobile from "@/hooks/isMobile";
import {  useLocation, useNavigate } from "react-router-dom";


type ChatMode = "selection" | "bot" | "admin";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("selection");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const locationRef = location.search;
    if (locationRef.includes("support")) {
      setIsOpen(true);
      navigate(`${location.pathname}`, { replace: true });
    }
  }, [location.search]);
  useEffect(() => {
    if (!isOpen) {
      setChatMode("selection");
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => setChatMode("selection"), 300);
  };

  const handleBack = () => {
    setChatMode("selection");
  };
  const isMobile = useIsMobile();
  return (
    <>
      {/* Chat Widget Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full",
          "bg-gradient-to-br from-primary to-accent shadow-chat",
          "transition-all duration-300 hover:scale-110 hover:shadow-xl",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          isOpen && "rotate-90"
        )}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-primary-foreground" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6 text-primary-foreground" />
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-primary/30 pulse-ring" />
          </>
        )}
      </button>
      {isMobile ? (
        <>
          <div
            className={cn(
              "fixed bottom-24 right-2 z-50 w-[340px] overflow-hidden rounded-2xl bg-card shadow-chat",
              "border border-border/50 backdrop-blur-sm",
              "transition-all duration-300 origin-bottom-left",
              isOpen
                ? "animate-slide-up opacity-100 scale-100"
                : "pointer-events-none opacity-0 scale-95"
            )}
          >
            {chatMode === "selection" ? (
              <SelectionScreen onSelect={setChatMode} />
            ) : (
              <ChatInterface
                isOpen={isOpen}
                mode={chatMode}
                onBack={handleBack}
                onClose={handleClose}
              />
            )}
          </div>
        </>
      ) : (
        <>
          {/* Chat Popup */}
          <div
            className={cn(
              "fixed bottom-24 right-6 z-50 w-[380px] overflow-hidden rounded-2xl bg-card shadow-chat",
              "border border-border/50 backdrop-blur-sm",
              "transition-all duration-300 origin-bottom-left",
              isOpen
                ? "animate-slide-up opacity-100 scale-100"
                : "pointer-events-none opacity-0 scale-95"
            )}
          >
            {chatMode === "selection" ? (
              <SelectionScreen onSelect={setChatMode} />
            ) : (
              <ChatInterface
                isOpen={isOpen}
                mode={chatMode}
                onBack={handleBack}
                onClose={handleClose}
              />
            )}
          </div>
        </>
      )}
    </>
  );
};

const SelectionScreen = ({
  onSelect,
}: {
  onSelect: (mode: "bot" | "admin") => void;
}) => {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-accent p-6 text-primary-foreground">
        <h3 className="text-xl font-semibold">Hi there! 👋</h3>
        <p className="mt-1 text-sm opacity-90">How can we help you today?</p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3 p-4">
        <button
          onClick={() => onSelect("bot")}
          className={cn(
            "group flex items-center gap-4 rounded-xl p-4",
            "bg-secondary/50 hover:bg-chat-bot/10",
            "border border-transparent hover:border-chat-bot/30",
            "transition-all duration-200"
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-chat-bot to-cyan-400">
            <Bot className="h-6 w-6 text-chat-bot-foreground" />
          </div>
          <div className="text-left">
            <h4 className="font-medium text-foreground">Chat with AI Bot</h4>
            <p className="text-sm text-muted-foreground">
              Get instant answers 24/7
            </p>
          </div>
        </button>

        <button
          onClick={() => onSelect("admin")}
          className={cn(
            "group flex items-center gap-4 rounded-xl p-4",
            "bg-secondary/50 hover:bg-primary/10",
            "border border-transparent hover:border-primary/30",
            "transition-all duration-200"
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
            <Headphones className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="text-left">
            <h4 className="font-medium text-foreground">Talk to Support</h4>
            <p className="text-sm text-muted-foreground">
              Connect with our team
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Send,
  Bot,
  Headphones,
  User,
  Shield,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/service/api";
import { useUser } from "@/hooks/authHook";
import useIsMobile from "@/hooks/isMobile";
import { is } from "@react-three/fiber/dist/declarations/src/core/utils";

interface Message {
  _id: string;
  text: string;
  messageType: "text" | "file" | "url";
  senderId: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  teamId?: {
    _id: string;
    name: string;
    id: string;
  };
  userId: string;
  isAdminMessage: boolean;
  isAdminReply: boolean;
  createdAt: string;
  updatedAt: string;
  readBy: string[];
}

interface ChatInterfaceProps {
  isOpen: boolean;
  mode: "bot" | "admin";
  onBack: () => void;
  onClose: () => void;
}

// URL detection regex
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

// Function to render message text with clickable links
const renderMessageText = (text: string) => {
  const parts = text.split(URL_REGEX);

  return parts.map((part, index) => {
    if (URL_REGEX.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:text-primary/80 hover:underline break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
          <ExternalLink className="h-3 w-3 inline" />
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

const ChatInterface = ({
  isOpen,
  mode,
  onBack,
  onClose,
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useUser().user;

  // Get auth data from localStorage
  const getAuthData = () => {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("token");
    const userId = user?._id;
    const teamId = localStorage.getItem("teamId");

    if (!token || !userId) {
      return null;
    }

    return { token, userId, teamId };
  };

  // Fetch support messages from API
  const fetchMessages = async () => {
    const authData = getAuthData();
    if (!authData) {
      setError("Please log in to continue");
      setIsLoading(false);
      return;
    }

    try {
      if (messages.length === 0) {
        // setIsLoading(true);
      } else {
        setIsLoading(false);
      }

      const params: any = {};
      if (authData.teamId) {
        params.teamId = authData.teamId;
      }
      const response = await api.get("/api/messages/supportMessages", {
        params,
      });
      if (response.data.success) {
        setMessages(response.data.data || []);
        setError(null);
      } else {
        setError("Failed to load messages");
      }
    } catch (err: any) {
      console.error("Error fetching messages:", err);
      setError(err.response?.data?.message || "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  // Send message to API
  const sendMessage = async (content: string) => {
    const authData = getAuthData();
    if (!authData) {
      setError("Please log in to send messages");
      return false;
    }
    if (mode !== "admin") {
      setError("Sorry we are developing this feature. Stay tuned!");
      return false;
    }

    try {
      const messageData = {
        userId: authData.userId,
        text: content,
        messageType: "text",
        isAdminMessage: false,
        teamId: null,
      };

      if (authData.teamId) {
        messageData.teamId = authData.teamId;
      }

      const response = await api.post(
        "/api/messages/admin/single",
        messageData
      );

      if (response.data.success) {
        const newMessage = response.data.data;
        setMessages((prev) => [newMessage, ...prev]);
        return true;
      }
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.response?.data?.message || "Failed to send message");
      return false;
    }
    return false;
  };

  // Add AI bot development message
  const addAIBotDevelopmentMessage = () => {
    const botDevMessage: Message = {
      _id: `bot-dev-${Date.now()}`,
      text: "Right now we are developing this AI chat bot feature. Stay tuned for updates coming soon!",
      messageType: "text",
      senderId: {
        _id: "system",
        name: "AI Assistant",
        email: "ai@example.com",
        profilePicture:
          "https://static.vecteezy.com/system/resources/previews/054/078/735/non_2x/gamer-avatar-with-headphones-and-controller-vector.jpg",
      },
      teamId: {
        _id: "bot-team",
        name: "AI Support",
        id: "bot-team",
      },
      userId: "system",
      isAdminMessage: false,
      isAdminReply: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readBy: [],
    };
    setMessages([botDevMessage]);
    setIsLoading(false);
  };

  // Fetch messages only when chat is opened
  useEffect(() => {
    if (isOpen) {
      if (mode === "admin") {
        fetchMessages();

        const intervalId = setInterval(fetchMessages, 5000);

        return () => {
          clearInterval(intervalId);
        };
      } else if (mode === "bot") {
        addAIBotDevelopmentMessage();
      }
    }
  }, [isOpen, mode]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const authData = getAuthData();
    const currentUser = {
      _id: authData?.userId || "user",
      name: "You",
      email: "",
      profilePicture:
        "https://static.vecteezy.com/system/resources/previews/054/078/735/non_2x/gamer-avatar-with-headphones-and-controller-vector.jpg",
    };

    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      text: input,
      messageType: "text",
      senderId: currentUser,
      userId: authData?.userId || "",
      isAdminMessage: false,
      isAdminReply: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readBy: [],
    };

    setMessages((prev) => [tempMessage, ...prev]);
    const messageToSend = input;
    setInput("");
    setIsTyping(true);

    const success = await sendMessage(messageToSend);

    if (!success) {
      const errorMessage: Message = {
        _id: `error-${Date.now()}`,
        text: "Failed to send message. Please try again.",
        messageType: "text",
        senderId: {
          _id: "system",
          name: "System",
          email: "system@example.com",
        },
        userId: authData?.userId || "",
        isAdminMessage: false,
        isAdminReply: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        readBy: [],
      };
      setMessages((prev) => [errorMessage, ...prev]);
    }

    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Format message timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if message is from current user
  const isCurrentUser = (senderId: string) => {
    const authData = getAuthData();
    return senderId === authData?.userId;
  };

  const isMobile = useIsMobile();

  return (
    <>
      {isOpen &&
        (isMobile ? (
          <>
            <div className="flex flex-col h-full w-full min-w-[250px]  max-w-[400px]  min-h-[350px] max-h-[520px] md:h-[520px] glass rounded-lg overflow-hidden">
              {/* Header */}
              <div
                className={cn(
                  "flex items-center justify-between p-3 flex-shrink-0",
                  mode === "bot"
                    ? "bg-gradient-to-r from-primary/90 to-secondary/90"
                    : "bg-gradient-to-r from-accent/90 to-secondary/90"
                )}
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <button
                    onClick={onBack}
                    className="rounded-full p-1.5 md:p-2 text-primary-foreground hover:bg-primary-foreground/10"
                    aria-label="Go back"
                  >
                    <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                  <div className="flex items-center gap-2 md:gap-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full glass",
                        mode === "bot"
                          ? "border border-primary/30"
                          : "border border-accent/30"
                      )}
                    >
                      {mode === "bot" ? (
                        <Bot className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                      ) : (
                        <Headphones className="h-4 w-4 md:h-5 md:w-5 text-accent" />
                      )}
                    </div>
                    <div className="max-w-[140px] md:max-w-none">
                      <h4 className="font-orbitron font-medium text-primary-foreground text-sm md:text-base truncate">
                        {mode === "bot" ? "AI Assistant" : "Support Team"}
                      </h4>
                      <p className="text-xs text-primary-foreground/70 truncate">
                        {mode === "bot"
                          ? "Always online"
                          : "All team members can view"}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => mode === "admin" && fetchMessages()}
                  className="text-xs text-primary-foreground/70 hover:text-primary-foreground whitespace-nowrap"
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Refresh"}
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 custom-scrollbar bg-gradient-to-b from-background/50 to-background">
                {isLoading && mode === "admin" ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="flex gap-2">
                      <span
                        className="h-3 w-3 rounded-full bg-primary animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="h-3 w-3 rounded-full bg-primary animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="h-3 w-3 rounded-full bg-primary animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="text-center p-4">
                      <p className="text-destructive mb-2 text-sm md:text-base">
                        {error}
                      </p>
                      <button
                        onClick={() => mode === "admin" && fetchMessages()}
                        className="text-sm text-primary hover:underline"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-muted-foreground text-sm md:text-base">
                      No messages yet. Start a conversation!
                    </p>
                  </div>
                ) : (
                  <>
                    {[...messages].reverse().map((message) => (
                      <div
                        key={message._id}
                        className={cn(
                          "flex flex-col",
                          isCurrentUser(message.senderId._id)
                            ? "items-end"
                            : "items-start"
                        )}
                      >
                        {/* Sender Info */}
                        <div className="flex items-center gap-2 mb-1 w-full max-w-[95%] md:max-w-[85%]">
                          {!isCurrentUser(message.senderId._id) &&
                          message.senderId.profilePicture ? (
                            <img
                              src={message.senderId.profilePicture}
                              alt={message.senderId.name}
                              className="h-4 w-4 md:h-5 md:w-5 rounded-full object-cover border border-white/20 flex-shrink-0"
                            />
                          ) : !isCurrentUser(message.senderId._id) ? (
                            <div className="h-4 w-4 md:h-5 md:w-5 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0">
                              <User className="h-2.5 w-2.5 md:h-3 md:w-3 text-primary-foreground" />
                            </div>
                          ) : null}

                          <div className="flex items-center gap-1 min-w-0">
                            <span className="text-xs font-medium text-muted-foreground truncate">
                              {isCurrentUser(message.senderId._id)
                                ? "You"
                                : message.senderId.name}
                            </span>
                            {message.isAdminReply &&
                              !isCurrentUser(message.senderId._id) && (
                                <Shield className="h-2.5 w-2.5 md:h-3 md:w-3 text-primary flex-shrink-0" />
                              )}
                            {message.senderId._id === "system" && (
                              <Bot className="h-2.5 w-2.5 md:h-3 md:w-3 text-cyan-500 flex-shrink-0" />
                            )}
                          </div>
                        </div>

                        {/* Message Bubble */}
                        <div
                          className={cn(
                            "w-full max-w-[95%] md:max-w-[85%] rounded-lg px-3 py-2 md:px-4 md:py-2.5 break-words overflow-hidden",
                            isCurrentUser(message.senderId._id)
                              ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
                              : message.isAdminMessage
                              ? "bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/30"
                              : message.senderId._id === "system"
                              ? "bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 border border-cyan-500/30"
                              : "glass border border-primary/20"
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">
                            {renderMessageText(message.text)}
                          </p>
                          <p
                            className={cn(
                              "mt-1 text-[10px] text-right",
                              isCurrentUser(message.senderId._id)
                                ? "text-primary-foreground/60"
                                : "text-muted-foreground"
                            )}
                          >
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-4 w-4 md:h-5 md:w-5 rounded-full bg-gradient-to-br from-accent/50 to-accent/30 flex items-center justify-center flex-shrink-0">
                            <Headphones className="h-2.5 w-2.5 md:h-3 md:w-3 text-accent" />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">
                            Support
                          </span>
                        </div>
                        <div className="glass border border-accent/20 rounded-lg px-3 py-2 md:px-4 md:py-3 max-w-[95%] md:max-w-[85%]">
                          <div className="flex gap-1">
                            <span
                              className="h-2 w-2 rounded-full bg-accent animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            />
                            <span
                              className="h-2 w-2 rounded-full bg-accent animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            />
                            <span
                              className="h-2 w-2 rounded-full bg-accent animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-glass-border p-3 md:p-4 bg-glass/30 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      mode === "admin"
                        ? "Message support team..."
                        : "Ask AI Assistant..."
                    }
                    disabled={isLoading || !!error}
                    className={cn(
                      "flex-1 rounded-full glass border border-glass-border",
                      "bg-background/50 px-3 py-2 md:px-4 md:py-2.5 text-sm",
                      "placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "min-w-0" // Prevents input from overflowing
                    )}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading || !!error}
                    className={cn(
                      "flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full flex-shrink-0",
                      "bg-gradient-to-r from-primary to-secondary text-primary-foreground",
                      "transition-all duration-200 hover:scale-105",
                      "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    )}
                    aria-label="Send message"
                  >
                    <Send className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </button>
                </div>
                {mode === "admin" && (
                  <p className="text-xs text-muted-foreground mt-2 text-center truncate">
                    All team members can see this conversation
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col h-full min-h-[400px] max-h-[calc(100vh-120px)] md:h-[520px] glass rounded-lg overflow-hidden">
            {/* Header */}
            <div
              className={cn(
                "flex items-center justify-between p-3 md:p-4 flex-shrink-0",
                mode === "bot"
                  ? "bg-gradient-to-r from-primary/90 to-secondary/90"
                  : "bg-gradient-to-r from-accent/90 to-secondary/90"
              )}
            >
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={onBack}
                  className="rounded-full p-1.5 md:p-2 text-primary-foreground hover:bg-primary-foreground/10"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
                </button>
                <div className="flex items-center gap-2 md:gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full glass",
                      mode === "bot"
                        ? "border border-primary/30"
                        : "border border-accent/30"
                    )}
                  >
                    {mode === "bot" ? (
                      <Bot className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    ) : (
                      <Headphones className="h-4 w-4 md:h-5 md:w-5 text-accent" />
                    )}
                  </div>
                  <div className="max-w-[140px] md:max-w-none">
                    <h4 className="font-orbitron font-medium text-primary-foreground text-sm md:text-base truncate">
                      {mode === "bot" ? "AI Assistant" : "Support Team"}
                    </h4>
                    <p className="text-xs text-primary-foreground/70 truncate">
                      {mode === "bot"
                        ? "Always online"
                        : "All team members can view"}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => mode === "admin" && fetchMessages()}
                className="text-xs text-primary-foreground/70 hover:text-primary-foreground whitespace-nowrap"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Refresh"}
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 custom-scrollbar bg-gradient-to-b from-background/50 to-background">
              {isLoading && mode === "admin" ? (
                <div className="flex justify-center items-center h-full">
                  <div className="flex gap-2">
                    <span
                      className="h-3 w-3 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="h-3 w-3 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="h-3 w-3 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center p-4">
                    <p className="text-destructive mb-2 text-sm md:text-base">
                      {error}
                    </p>
                    <button
                      onClick={() => mode === "admin" && fetchMessages()}
                      className="text-sm text-primary hover:underline"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <p className="text-muted-foreground text-sm md:text-base">
                    No messages yet. Start a conversation!
                  </p>
                </div>
              ) : (
                <>
                  {[...messages].reverse().map((message) => (
                    <div
                      key={message._id}
                      className={cn(
                        "flex flex-col",
                        isCurrentUser(message.senderId._id)
                          ? "items-end"
                          : "items-start"
                      )}
                    >
                      {/* Sender Info */}
                      <div className="flex items-center gap-2 mb-1 w-full max-w-[95%] md:max-w-[85%]">
                        {!isCurrentUser(message.senderId._id) &&
                        message.senderId.profilePicture ? (
                          <img
                            src={message.senderId.profilePicture}
                            alt={message.senderId.name}
                            className="h-4 w-4 md:h-5 md:w-5 rounded-full object-cover border border-white/20 flex-shrink-0"
                          />
                        ) : !isCurrentUser(message.senderId._id) ? (
                          <div className="h-4 w-4 md:h-5 md:w-5 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0">
                            <User className="h-2.5 w-2.5 md:h-3 md:w-3 text-primary-foreground" />
                          </div>
                        ) : null}

                        <div className="flex items-center gap-1 min-w-0">
                          <span className="text-xs font-medium text-muted-foreground truncate">
                            {isCurrentUser(message.senderId._id)
                              ? "You"
                              : message.senderId.name}
                          </span>
                          {message.isAdminReply &&
                            !isCurrentUser(message.senderId._id) && (
                              <Shield className="h-2.5 w-2.5 md:h-3 md:w-3 text-primary flex-shrink-0" />
                            )}
                          {message.senderId._id === "system" && (
                            <Bot className="h-2.5 w-2.5 md:h-3 md:w-3 text-cyan-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={cn(
                          "w-full max-w-[95%] md:max-w-[85%] rounded-lg px-3 py-2 md:px-4 md:py-2.5 break-words overflow-hidden",
                          isCurrentUser(message.senderId._id)
                            ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
                            : message.isAdminMessage
                            ? "bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/30"
                            : message.senderId._id === "system"
                            ? "bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 border border-cyan-500/30"
                            : "glass border border-primary/20"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">
                          {renderMessageText(message.text)}
                        </p>
                        <p
                          className={cn(
                            "mt-1 text-[10px] text-right",
                            isCurrentUser(message.senderId._id)
                              ? "text-primary-foreground/60"
                              : "text-muted-foreground"
                          )}
                        >
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-4 w-4 md:h-5 md:w-5 rounded-full bg-gradient-to-br from-accent/50 to-accent/30 flex items-center justify-center flex-shrink-0">
                          <Headphones className="h-2.5 w-2.5 md:h-3 md:w-3 text-accent" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          Support
                        </span>
                      </div>
                      <div className="glass border border-accent/20 rounded-lg px-3 py-2 md:px-4 md:py-3 max-w-[95%] md:max-w-[85%]">
                        <div className="flex gap-1">
                          <span
                            className="h-2 w-2 rounded-full bg-accent animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <span
                            className="h-2 w-2 rounded-full bg-accent animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <span
                            className="h-2 w-2 rounded-full bg-accent animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-glass-border p-3 md:p-4 bg-glass/30 flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    mode === "admin"
                      ? "Message support team..."
                      : "Ask AI Assistant..."
                  }
                  disabled={isLoading || !!error}
                  className={cn(
                    "flex-1 rounded-full glass border border-glass-border",
                    "bg-background/50 px-3 py-2 md:px-4 md:py-2.5 text-sm",
                    "placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "min-w-0" // Prevents input from overflowing
                  )}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading || !!error}
                  className={cn(
                    "flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full flex-shrink-0",
                    "bg-gradient-to-r from-primary to-secondary text-primary-foreground",
                    "transition-all duration-200 hover:scale-105",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  )}
                  aria-label="Send message"
                >
                  <Send className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </button>
              </div>
              {mode === "admin" && (
                <p className="text-xs text-muted-foreground mt-2 text-center truncate">
                  All team members can see this conversation
                </p>
              )}
            </div>
          </div>
        ))}
    </>
  );
};

export default ChatInterface;

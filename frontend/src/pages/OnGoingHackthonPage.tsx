import { PageLayout } from "@/components/layout/page-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { TeamChatHeader } from "../components/team-chat/index";
import { HackathonDetails } from "../components/team-chat";
import { ProblemStatements } from "../components/team-chat";
import { TeamMembers } from "../components/team-chat";
import { TeamChatMessages } from "../components/team-chat";
import { ProjectSubmission } from "../components/team-chat";
import {
  MessageSkeleton,
  TeamMemberSkeleton,
  HackathonDetailSkeleton,
} from "../components/team-chat/skeletons";

import { motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/redux-hooks";
import { useUser } from "@/hooks/authHook";
import { showError, showWarning } from "@/components/ui/ToasterMsg";
import { webSocketService } from "@/store";
import { changeConnect } from "@/store/slices/websocketSlice";
import {
  fetchTeamMessages,
  fetchUserTeam,
  setUserMessages,
  setUserTeam,
} from "@/store/slices/teamSlice";
import { Hackathon } from "@/types/hackathon";
import { Check, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { verify } from "crypto";
import { verifyToken } from "@/store/slices/authSlice";
import { api } from "@/service/api";
import AnimationPageLayout from "./Animation/AnimationPageLayout";

// Project Submission Popup Component
interface ProjectSubmissionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (submission: { type: string; link: string; ppt?: string }) => void;
}

const ProjectSubmissionPopup: React.FC<ProjectSubmissionPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedType, setSelectedType] = useState("github");
  const [link, setLink] = useState("");
  const [pptLink, setPptLink] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!link.trim()) {
      showWarning("Please provide a valid link", "Submission Error");
      return;
    }

    onSubmit({
      type: selectedType,
      link: link.trim(),
      ppt: pptLink.trim() || undefined,
    });

    // Reset form
    setLink("");
    setPptLink("");
    setSelectedType("github");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background border border-border rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-semibold mb-4">Submit Project</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Submission Type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Submission Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 border border-border rounded-md bg-background"
            >
              <option value="github">GitHub Repository</option>
              <option value="drive">Drive Link</option>
              <option value="other">Other Link</option>
            </select>
          </div>

          {/* Main Link */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {selectedType === "github"
                ? "GitHub Repository URL"
                : selectedType === "drive"
                ? "Google Drive Link"
                : "Project Link"}
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder={
                selectedType === "github"
                  ? "https://github.com/username/repo"
                  : selectedType === "drive"
                  ? "https://drive.google.com/..."
                  : "https://your-project-link.com"
              }
              className="w-full p-2 border border-border rounded-md bg-background"
              required
            />
          </div>

          {/* Optional PPT Link */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Presentation Slides (Optional)
            </label>
            <input
              type="url"
              value={pptLink}
              onChange={(e) => setPptLink(e.target.value)}
              placeholder="https://drive.google.com/... or PPT link"
              className="w-full p-2 border border-border rounded-md bg-background"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-border rounded-md hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export function PopupMessage({ message, show }) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 right-5 bg-gray-900 text-white px-4 py-2 rounded-xl shadow-lg transition-all duration-500">
      {message}
    </div>
  );
}

export default function OnGoingHackthonPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentUser } = useAppSelector((state) => state.team);
  const { hackathon } = useAppSelector((state) => state.userHack);
  const teamData = useAppSelector((state) => state.team);
  const { user } = useUser();
  const teamId = teamData.team?._id || "";
  const teamMembers = teamData.members || [];
  const { isConnected } = useAppSelector((state) => state.websocket);
  const messages = useAppSelector((state) => state.team.messages);
  const messagesLoading = useAppSelector((state) => state.team.messageLoading);
  const onlineUsers = useAppSelector((state) => state.team.onlineUsers);
  const [newMessage, setNewMessage] = useState<string>("");
  const timeLeft = useAppSelector(
    (state) => state?.userHack?.hackathon?.endDate
  );
  const [isConnecting, setIsConnecting] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [showSubmissionPopup, setShowSubmissionPopup] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Add refs to track initialization state
  const initializedRef = useRef(false);
  const wsConnectedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (initializedRef.current) return;

    const initializeData = async () => {
      try {
        setIsConnecting(true);
        setIsDataLoading(true);

        if (!user) {
          navigate("/login");
          return;
        }

        const token = localStorage.getItem("token") || user?.token;

        // WebSocket connection with better state management
        if (token && !wsConnectedRef.current) {
          if (!webSocketService.isConnected) {
            if (isConnected) {
              return;
            }
            webSocketService.connect(token);
            wsConnectedRef.current = true;
            dispatch(changeConnect({ changeStatus: true }));
          }
        }
      } catch (error) {
        console.error("Initialization failed:", error);
        showWarning("Failed to load team data", "Error");
      } finally {
        setIsConnecting(false);
        initializedRef.current = true;
      }
    };
    dispatch(verifyToken());
    initializeData();
  }, [dispatch, navigate, user]); // ✅ Remove teamId from dependencies
  const { teamId: routeTeamId } = useAppSelector((state) => state.id) || "";
  // Separate useEffect for fetching messages when teamId is available
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await api.post(`/api/page/team-chat`);
        console.log("TEAD DATA PAGE ::::::::::");
        console.log(response.data);
        setIsDataLoading(true);
        if (response.data?.data?.team) {
          dispatch(
            setUserTeam({
              ...response.data?.data?.team,
              userId: user?._id || "",
            })
          );
        }
        if (response.data?.data?.messages) {
          dispatch(setUserMessages(response.data?.data?.messages));
        }
      } catch (error) {
        showError("Failed to fetch messages:", error);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchMessages();
  }, [teamId, dispatch]);

  // Check if all required data is loaded
  const isDataLoaded = useCallback(() => {
    return (
      !isConnecting &&
      !isDataLoading &&
      !messagesLoading &&
      hackathon &&
      teamData.team &&
      teamMembers.length > 0 &&
      user
    );
  }, [
    isConnecting,
    isDataLoading,
    messagesLoading,
    hackathon,
    teamData.team,
    teamMembers,
    user,
  ]);
  useEffect(() => {
    return () => {
      // Cleanup WebSocket connection if needed
      if (wsConnectedRef.current) {
        // webSocketService.disconnect(); // Uncomment if you have disconnect method
        wsConnectedRef.current = false;
      }
    };
  }, []);

  // Add error boundary to catch WebSocket errors
  // useEffect(() => {
  //   const handleWebSocketError = () => {
  //     showWarning('WebSocket connection lost. Reconnecting...', 'Connection Error');
  //     wsConnectedRef.current = false;
  //   };
  //   console.log('Setting up WebSocket error handler');
  //   // Assuming your webSocketService has event listeners
  //   // webSocketService.on('error', handleWebSocketError);

  //   return () => {
  //     // webSocketService.off('error', handleWebSocketError);
  //   };
  // }, []);
  // Navigate if data doesn't load after timeout
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isDataLoaded()) {
        showWarning(
          "Unable to load team data. Redirecting...",
          "Loading Error"
        );
        navigate("/dashboard"); // or your fallback route
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timeoutId);
  }, [isDataLoaded, navigate]);

  // // WebSocket connection and data loading
  // useEffect(() => {
  //   const initializeWebSocket = async () => {
  //     try {
  //       setIsConnecting(true);
  //       setIsDataLoading(true);

  //       // Check if user is authenticated
  //       if (!user) {
  //         navigate('/login');
  //         return;
  //       }

  //       // Connect to WebSocket if not already connected
  //       const token = localStorage.getItem('token') || user?.token;
  //       if (token && !webSocketService.isConnected) {
  //         if(isConnected){
  //           return;
  //         }
  //         webSocketService.connect(token);
  //         dispatch(changeConnect({ changeStatus: true }));
  //       }

  //       // Fetch team data
  //       if (user?._id && user?.currentHackathonId) {
  //         await dispatch(fetchUserTeam({
  //           userId: user._id,
  //           hackathonId: user.currentHackathonId
  //         })).unwrap();

  //         if (teamId) {
  //           await dispatch(fetchTeamMessages({ teamId })).unwrap();
  //         }
  //       }

  //     } catch (error) {
  //       console.error('Failed to initialize:', error);
  //       showWarning('Failed to load team data', 'Error');
  //       navigate('/dashboard');
  //     } finally {
  //       setIsConnecting(false);
  //       setIsDataLoading(false);
  //     }
  //   };

  //   initializeWebSocket();
  // }, [teamId, user, dispatch, navigate]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleProjectSubmit = (submission: {
    type: string;
    link: string;
    ppt?: string;
  }) => {
    // Handle project submission logic here
    console.log("Project submitted:", submission);
    // You can dispatch an action to save the submission
    showSuccess("Project submitted successfully!", "Submission Complete");
  };
  const onSubmissionClick = () => {
    setShowSubmissionPopup(true);
  };
  // Safely create hackathonData with fallback values
  const hackathonData: Hackathon = {
    _id: hackathon?._id || "hackathon_001",
    title: hackathon?.title || "AI Innovation Challenge",
    description:
      hackathon?.description ||
      "Build an AI-powered collaboration tool that revolutionizes how teams work together in virtual environments.",
    registrationDeadline:
      hackathon?.registrationDeadline || "2025-09-05T23:59:59Z",
    startDate: hackathon?.startDate || "2025-09-10T09:00:00Z",
    endDate: hackathon?.endDate || "2025-09-12T18:00:00Z",
    winnerAnnouncementDate:
      hackathon?.winnerAnnouncementDate || "2025-09-15T12:00:00Z",
    isActive: hackathon?.isActive ?? true,

    problemStatements: hackathon?.problemStatements || [
      "Design an AI assistant that can predict team conflicts before they occur.",
      "Create a smart workspace that adapts to individual working styles.",
      "Develop a real-time collaboration tool with advanced analytics.",
    ],

    maxTeamSize: hackathon?.maxTeamSize || 4,
    venue: hackathon?.venue || "Tech Hub Convention Center, Bengaluru, India",
    mode: hackathon?.mode || "hybrid",
    registrationFee: hackathon?.registrationFee || 50,

    prizes: hackathon?.prizes || [
      {
        position: "1st Place",
        amount: 2000,
        description: "Cash prize + internship opportunity + trophy",
      },
      {
        position: "2nd Place",
        amount: 1000,
        description: "Cash prize + certificate of excellence",
      },
      {
        position: "3rd Place",
        amount: 500,
        description: "Cash prize + certificate of participation",
      },
    ],

    tags: hackathon?.tags || [
      "AI",
      "Collaboration",
      "Innovation",
      "SaaS",
      "Hackathon",
    ],

    totalMembersJoined: hackathon?.totalMembersJoined || 236,
    maxRegistrations: hackathon?.maxRegistrations || 1000,

    requirements: hackathon?.requirements || [
      "Teams must have at least 2 members and no more than 4.",
      "Each project must include a working demo or prototype.",
      "All submissions must include a GitHub repository link.",
    ],

    rules: hackathon?.rules || [
      "Participants must adhere to the code of conduct.",
      "All code must be written during the hackathon.",
      "Any plagiarism will result in disqualification.",
      "Judges' decisions are final.",
    ],

    bannerImage:
      hackathon?.bannerImage ||
      "https://example.com/images/hackathon-banner-ai-innovation.png",

    evaluationCriteria: hackathon?.evaluationCriteria || [
      { criterion: "Innovation", weight: 30 },
      { criterion: "Technical Implementation", weight: 25 },
      { criterion: "Design & Usability", weight: 20 },
      { criterion: "Impact", weight: 15 },
      { criterion: "Presentation", weight: 10 },
    ],

    submissionDeadline: hackathon?.submissionDeadline || "2025-09-12T17:00:00Z",
    submissionFormat:
      hackathon?.submissionFormat ||
      "GitHub repository + Live demo + Presentation slides",

    organizer: hackathon?.organizer || {
      name: "Mukul Sharma",
      contactEmail: "organizer@techhub.org",
      contactNumber: "+91-9876543210",
      organization: "TechHub Foundation",
    },

    faqs: hackathon?.faqs || [
      {
        question: "Can I participate individually?",
        answer:
          "Yes, solo participants are allowed, but teamwork is encouraged for better results.",
      },
      {
        question: "What is the maximum team size?",
        answer: "Teams can have up to 4 members.",
      },
      {
        question: "Is there a registration fee refund policy?",
        answer:
          "Registration fees are non-refundable once paid, except if the event is canceled.",
      },
    ],

    socialLinks: hackathon?.socialLinks || {
      website: "https://techhub.org/hackathon2025",
      linkedin: "https://linkedin.com/company/techhub",
      twitter: "https://twitter.com/techhub_ai",
      discord: "https://discord.gg/techhub",
    },

    status: hackathon?.status || "ongoing",
    reason: hackathon?.reason || undefined,
    createdAt: hackathon?.createdAt || "2025-07-15T10:00:00Z",
    updatedAt: hackathon?.updatedAt || "2025-08-20T15:30:00Z",
  };

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const getStatusIcon = useCallback((status: string, isOwnMessage: boolean) => {
    if (!isOwnMessage) return null;

    switch (status) {
      case "sent":
        return <Check className="w-3 h-3 ml-1" title="Sent" />;
      case "delivered":
        return <CheckCheck className="w-3 h-3 ml-1" title="Delivered" />;
      case "seen":
        return (
          <CheckCheck className="w-3 h-3 ml-1 text-blue-500" title="Seen" />
        );
      default:
        return null;
    }
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !webSocketService.isConnected) {
      <PopupMessage
        message={`Cannot send message. Not connected. Status: ${
          webSocketService.isConnected ? "Connected" : "Disconnected"
        }`}
        show={true}
      />;
      return;
    }

    if (newMessage.trim().length > 1000) {
      showWarning(
        "Message is too long. Please keep it under 1000 characters.",
        "Message Validate"
      );
      return;
    }

    // Prevent duplicate spam
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage &&
      lastMessage.text === newMessage.trim() &&
      lastMessage.senderId === currentUser
    ) {
      showWarning(
        "Please avoid sending duplicate messages.",
        "Message Validate"
      );
      return;
    }

    // Send message via WebSocket
    webSocketService.sendTeamMessage(teamId, newMessage.trim());
    setNewMessage("");
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Show loading state until all data is available
  if (!isDataLoaded()) {
    return (
      <PageLayout showBackground={true} className="bg-background">
        <div className="min-h-screen p-4 xs:p-5 sm:p-6">
          {/* Header Skeleton */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
            <div className="space-y-2">
              <div className="h-8 bg-gray-300 rounded w-64 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
            </div>
            <div className="bg-background/80 backdrop-blur-sm rounded-lg px-6 py-4 border border-border w-48">
              <div className="h-6 bg-gray-300 rounded w-full animate-pulse"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Content Skeleton */}
            <div className="xl:col-span-2 space-y-6">
              <GlassCard className="p-6">
                <HackathonDetailSkeleton />
              </GlassCard>

              <GlassCard className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-300 rounded w-48 animate-pulse"></div>
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="h-4 bg-gray-300 rounded w-full animate-pulse"
                    ></div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
                  <div className="h-64 bg-gray-100 rounded-lg space-y-4 p-4">
                    {[1, 2, 3, 4].map((item) => (
                      <MessageSkeleton key={item} />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-12 bg-gray-300 rounded animate-pulse"></div>
                    <div className="w-12 h-12 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-6">
              <GlassCard className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-300 rounded w-40 animate-pulse"></div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <TeamMemberSkeleton key={item} />
                    ))}
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-300 rounded w-48 animate-pulse"></div>
                  <div className="h-16 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-10 bg-gray-300 rounded animate-pulse"></div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <>
      {/* <AnimationPageLayout /> */}
      <PageLayout showBackground={true} className="bg-background">
        <div className="min-h-screen p-4 xs:p-5 sm:p-6">
          <TeamChatHeader
            hackathonTitle={hackathonData.title}
            timeLeft={timeLeft}
            onRefresh={handleRefresh}
          />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xs:gap-5 sm:gap-6">
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-4 xs:space-y-5 sm:space-y-6">
              {/* <HackathonDetails
                hackathonData={hackathonData}
                formatDate={formatDate}
              /> */}

              <ProblemStatements
                problemStatements={hackathonData.problemStatements}
              />

              <TeamChatMessages
                messages={messages}
                messagesLoading={messagesLoading}
                teamMembers={teamMembers}
                currentUser={currentUser}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                handleSendMessage={handleSendMessage}
                formatDate={formatDate}
                getStatusIcon={getStatusIcon}
                inputRef={inputRef}
                chatEndRef={chatEndRef}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-4 xs:space-y-5 sm:space-y-6">
              <TeamMembers
                teamMembers={teamMembers}
                currentUser={currentUser}
                onlineUsers={onlineUsers}
                teamName={teamData.teamName || "Your Team"}
                maxTeamSize={hackathonData.maxTeamSize}
                teamDetails={teamData}
              />

              <ProjectSubmission
                submissionDeadline={hackathonData.submissionDeadline}
                submissionFormat={hackathonData.submissionFormat}
                formatDate={formatDate}
                onSubmissionClick={() => setShowSubmissionPopup(true)}
              />
            </div>
          </div>
        </div>
      </PageLayout>

      {/* Project Submission Popup */}
      <ProjectSubmissionPopup
        isOpen={showSubmissionPopup}
        onClose={() => setShowSubmissionPopup(false)}
        onSubmit={handleProjectSubmit}
      />
    </>
  );
}

import { useState, useEffect } from "react";
import {
  Clock,
  Users,
  MapPin,
  Calendar,
  Trophy,
  DollarSign,
  CheckCircle,
  XCircle,
  PlayCircle,
  Globe,
  Linkedin,
  Twitter,
  MessageSquare,
  Send,
  ThumbsUp,
  AlertCircle,
  Target,
  FileText,
  Award,
  Mail,
  Phone,
  Building2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader,
  IndianRupee,
} from "lucide-react";
import {
  setError as setErr,
  setLoading as setLoad,
} from "@/slices/profileSlice";
import { showError, showSuccess } from "@/components/ui/ToasterMsg";
import { API_URL } from "@/config/API_URL";
import axios from "axios";
import { useParams } from "react-router-dom";
import PaymentModal from "@/components/PaymentModal";
import { api } from "@/service/api";
import { useUser } from "@/hooks/authHook";
import useIsMobile  from "@/hooks/isMobile";
import { error } from "console";
import HandleFreeRegistration from "@/components/HandleFreeRegistration";

interface Hackathon {
  hackathonId: number;
  hackName: string;
  title: string;
  description: string;
  extraDetail?: string;
  specialDetail?: string;
  registrationDeadline: string;
  startDate: string;
  endDate: string;
  winnerAnnouncementDate?: string;
  submissionDeadline?: string;
  submissionFormat?: string;
  status: string;
  problemStatements: string[];
  maxTeamSize: number;
  minParticipantsToFormTeam: number;
  venue: string;
  mode: string;
  registrationFee: number;
  prizes: Array<{
    position: string;
    amount: number;
    rewards?: string;
  }>;
  evaluationCriteria: Array<{
    criterion: string;
    weight: number;
  }>;
  tags: string[];
  totalMembersJoined: number;
  maxRegistrations?: number;
  requirements: string[];
  rules: string[];
  bannerImage?: string;
  discussions: Discussion[];
  organizer: {
    name: string;
    contactEmail: string;
    contactNumber?: string;
    organization: string;
  };
  socialLinks?: {
    website?: string;
    linkedin?: string;
    twitter?: string;
    discord?: string;
  };
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

interface UserRegistrationStatus {
  status: "not_registered" | "pending" | "registered" | "cancelled";
  // status: 'not_registered' | 'pending_payment' | 'pending' | 'registered' | 'cancelled';
  orderId?: string;
  paymentId?: string;
  paymentMethod?: "razorpay" | "qrcode";
  createdAt?: string;
  lastChecked?: string;
  message?: string;
}

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface Reply {
  _id: number;
  user: UserSchema;
  content: string;
  timestamp: string;
  likes: number;
}
interface UserSchema {
  _id: string;
  name: string;
  email: string;
  profilePicture: string;
  profileCompletion: number;
}

interface Discussion {
  _id: number;
  user: UserSchema;
  title: string;
  content?: string;
  timestamp: string;
  likes: number;
  replies: Reply[]; // Changed from [string] to Reply array
}

const CyberHackathonDetail = () => {
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [countdown, setCountdown] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [registrationStatus, setRegistrationStatus] =
    useState<UserRegistrationStatus>({ status: "pending" });
  const [isPaymentloading, setPaymentLoading] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFreeRegistrationModal, setShowFreeRegistrationModal] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "rules" | "faq" | "discussion"
  >("overview");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [statusCheckLoading, setStatusCheckLoading] = useState(false);
  const isMobile = useIsMobile();
  // const [discussions, setDiscussions] = useState<Discussion[]>([
  //   {
  //     _id: 1,
  //     user: "QuantumCoder",
  //     avatar: "QC",
  //     title: "How to optimize quantum circuits for better performance?",
  //     content:
  //       "You can use gate fusion techniques and optimize qubit allocation...",
  //     timestamp: "2 hours ago",
  //     likes: 12,
  //     replies: [
  //       {
  //         _id: 1,
  //         user: "QuantumFan",
  //         avatar: "QF",
  //         content:
  //           "Great explanation! Also consider using variational quantum algorithms.",
  //         timestamp: "1 hour ago",
  //         likes: 3,
  //       },
  //       {
  //         _id: 2,
  //         user: "PhysicsLover",
  //         avatar: "PL",
  //         content:
  //           "Don't forget about error correction codes for better reliability.",
  //         timestamp: "45 minutes ago",
  //         likes: 1,
  //       },
  //     ],
  //   },
  // ]);

  const { id } = useParams();
  const { user } = useUser();
  // Get user email from your auth system
  const getUserEmail = () => {
    // Replace this with your actual user email retrieval
    return user.email;
  };
  const [err, setErr] = useState(null);
  const [load, setLoad] = useState(true);

  const fetchHackathonData = async () => {
    try {
      // if(!hackathon){
      //   setLoad(true);
      // }
      setErr(null);
      console.log("Fetching hackathon with ID:", id);

      if (!id || (id.length !== 24 && id.length !== 3)) {
        setLoad(false);
        setErr("Invalid hackathon ID");
        return;
      }
      const response = await axios.get(`${API_URL}/api/hackathons/${id}`);

      if (response.data.success) {
        setHackathon(response.data.data);
        // console.log("Fetched hackathon:", response.data.data);
      } else {
        setErr(response.data.message || "Failed to fetch hackathon");
      }
    } catch (err) {
      console.error("Fetch hackathon error:", err);
      setErr("Failed to load hackathon details");
      showError(
        err.response?.data?.message || "Failed to load hackathon details"
      );
    } finally {
      setLoad(false);
    }
  };

  const fetchHackathonDataInterval = async () => {
    try {
      // setLoading(true);
      setErr(null);

      if (!id || id.length !== 24) {
        setErr("Invalid hackathon ID");
        return;
      }

      const response = await axios.get(`${API_URL}/api/hackathons/${id}`);

      if (response.data.success) {
        setHackathon(response.data.data);
                setLoad(false);
      } else {
        setErr(response.data.message || "Failed to fetch hackathon");
      }
    } catch (err) {
      console.error("Fetch hackathon error:", err);
      setErr("Failed to load hackathon details");
      showError(
        err.response?.data?.message || "Failed to load hackathon details"
      );
    } finally {
      setLoad(false);
    }
  };

  // Check user registration status
  const checkRegistrationStatus = async () => {
    if (!hackathon || !getUserEmail()) return;

    try {
      setStatusCheckLoading(true);
      const response = await axios.get(`${API_URL}/api/registrations/status`, {
        params: {
          hackathonId: hackathon.hackathonId,
          email: getUserEmail(),
        },
      });

      if (response.data.success) {
        setRegistrationStatus({ status: response.data.data.status });
        // console.log("Registration status:", registrationStatus);
      } else {
        console.error("Status check error:", response.data.message);
        showError(
          response.data.message || "Failed to check registration status"
        );
      }
    } catch (err) {
      console.error("Status check error:", err);
      // Don't show error for status check failures
    } finally {
      // setStatusCheckLoading(false);
    }
  };

  // Verify payment status
  const verifyPaymentStatus = async (orderId: string) => {
    try {
      setPaymentLoading(true);
      const response = await api.post(`${API_URL}/api/payments/verify-status`, {
        orderId,
        email: getUserEmail(),
      });

      if (response.data.success) {
        setRegistrationStatus(response.data.data);
        if (response.data.data.status === "registered") {
          showSuccess("Registration verified successfully! You are now registered.");
        }
      } else {
        showError(response.data.message || "Registration verification failed");
      }
    } catch (err) {
      console.error("Registration verification error:", err);
      showError("Failed to verify Registration status");
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    // Fetch immediately
    fetchHackathonData();

    // Set up interval for every 20 seconds
    const intervalId = setInterval(() => {
      fetchHackathonData();
    }, 20000); // 20000ms = 20 seconds

    // Cleanup interval on unmount or href change
    return () => clearInterval(intervalId);
  }, [id]); // dependency on URL
  // useEffect(() => {
  //   if (hackathon) {
  //     checkRegistrationStatus();
  //   }
  // }, [hackathon]);

  useEffect(() => {
    if (!hackathon) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const deadline = new Date(hackathon.registrationDeadline).getTime();
      const distance = deadline - now;

      if (distance < 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [hackathon]);

  // Auto-check status for pending payments
  useEffect(() => {
    // Run it once immediately when component mounts or hackathon changes
    if (hackathon) {
      checkRegistrationStatus();
    }

    // Set up the interval
    const intervalId = setInterval(() => {
      if (hackathon) {
        checkRegistrationStatus();
      }
    }, 30000); // every 30 seconds

    // Cleanup on unmount or when hackathon changes
    return () => clearInterval(intervalId);
  }, [hackathon]);

  const getStatusConfig = (status: string) => {
    const config = {
      registration_open: {
        color: "text-green-400",
        bg: "bg-green-400/10",
        border: "border-green-400/20",
        icon: PlayCircle,
        label: "Registration Open",
      },
      registration_closed: {
        color: "text-red-400",
        bg: "bg-red-400/10",
        border: "border-red-400/20",
        icon: XCircle,
        label: "Registration Closed",
      },
      ongoing: {
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        border: "border-blue-400/20",
        icon: PlayCircle,
        label: "Ongoing",
      },
      winner_to_announced: {
        color: "text-yellow-400",
        bg: "bg-yellow-400/10",
        border: "border-yellow-400/20",
        icon: Clock,
        label: "Winner to be Announced",
      },
      completed: {
        color: "text-purple-400",
        bg: "bg-purple-400/10",
        border: "border-purple-400/20",
        icon: CheckCircle,
        label: "Completed",
      },
      cancelled: {
        color: "text-gray-400",
        bg: "bg-gray-400/10",
        border: "border-gray-400/20",
        icon: XCircle,
        label: "Cancelled",
      },
    };
    return config[status as keyof typeof config] || config.registration_open;
  };

  const getRegistrationButtonConfig = () => {
    const baseClasses =
      "w-full py-4 px-6 rounded-xl font-orbitron text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2";

    switch (registrationStatus.status) {
      case "registered":
        return {
          text: "Registered ✓",
          className: `${baseClasses} bg-green-500/20 text-green-400 border-2 border-green-400/40 cursor-not-allowed`,
          disabled: true,
          icon: CheckCircle,
        };

      case "pending":
        return {
          text: "Verifying Registration...",
          className: `${baseClasses} bg-yellow-500/20 text-yellow-400 border-2 border-yellow-400/40 cursor-not-allowed`,
          disabled: true,
          icon: Loader,
        };
      case "cancelled":
        return {
          text: "Registration Failed - Retry",
          className: `${baseClasses} bg-red-500/20 text-red-400 border-2 border-red-400/40 hover:scale-105`,
          disabled: false,
          icon: XCircle,
        };

      default:
        return {
          text:
            hackathon?.status === "registration_open"
              ? "Join Hackathon"
              : "Registration Closed",
          className: `${baseClasses} ${
            hackathon?.status === "registration_open"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 animate-glow"
              : "bg-slate-700/50 text-slate-400 border-2 border-slate-600/40 cursor-not-allowed"
          }`,
          disabled: hackathon?.status !== "registration_open",
          icon:
            hackathon?.status === "registration_open" ? PlayCircle : XCircle,
        };
    }
  };

  const handleJoinClick = () => {
    // if (registrationStatus.status === "not_registered") {
    //   setShowPaymentModal(true);
    // } else if (hackathon?.registrationFee > 0) {
    //   setShowFeeModal(true);
    // } else {
    //   // handleFreeRegistration();
    // }

    if (registrationStatus.status === "not_registered") {
      setShowFreeRegistrationModal(true);
    }
  };

  // const handleFreeRegistration = async () => {
  //   try {
  //     setPaymentLoading(true);
  //     const response = await api.post(`${API_URL}/api/registrations/free`, {
  //       hackathonId: hackathon?.hackathonId,
  //       email: getUserEmail()
  //     });

  //     if (response.data.success) {
  //       setRegistrationStatus({ status: 'registered' });
  //       showSuccess('Successfully registered for the hackathon!');
  //     }
  //   } catch (err) {
  //     showError(err.response?.data?.message || 'Registration failed');
  //   } finally {
  //     setPaymentLoading(false);
  //   }
  // };

  const handlePaymentSuccess = (orderData: any) => {
    // setRegistrationStatus({
    //   status: "pending",
    //   orderId: orderData.orderId,
    //   paymentMethod: orderData.paymentMethod,
    //   message: "Payment submitted. We are verifying your transaction...",
    // });
    // setShowPaymentModal(false);
    setRegistrationStatus({
      status: "pending",
      orderId: orderData.orderId,
      paymentMethod: orderData.paymentMethod,
      message: "Almost Done. We are verifying your registration...",
    });
    setShowFreeRegistrationModal(false);
  };

  const handleManualVerify = () => {
    if (registrationStatus.orderId) {
      verifyPaymentStatus(registrationStatus.orderId);
    }
  };

  const [questionTitle, setQuestionTitle] = useState("");
  const [questionDescription, setQuestionDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleReplyDiscussion = async (replyId: number) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Validate required fields
      if (!replyContent.trim()) {
        showError("Please enter a reply");
        setIsSubmitting(false);
        return;
      }
      const replyData = {
        content: replyContent,
      };

      const response = await fetch(
        `${API_URL}/api/hackathons/discussion/reply/${id}/${replyId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(replyData),
        }
      );

      const result = await response.json();

      if (result.success) {
        showSuccess("Reply posted successfully!");

        // Reset form
        setReplyContent("");
        //console.log(result.data)
        setHackathon(result.data);
        //setDiscussions((prevDiscussions) => [...prevDiscussions, result.data]);
      } else {
        showError(result.message || "Failed to post Reply");
      }
    } catch (error) {
      console.error("Error posting Reply:", error);
      showError("An error occurred while posting your Reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAskQuestion = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!questionTitle.trim()) {
        showError("Please enter a question title");
        setIsSubmitting(false);
        return;
      }

      // Prepare discussion data
      const discussionData = {
        title: questionTitle,
        content: questionDescription || "",
        tags: tags,
      };

      // Make API call to create discussion
      const response = await fetch(
        `${API_URL}/api/hackathons/discussion/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(discussionData),
        }
      );

      const result = await response.json();

      if (result.success) {
        showSuccess("Question posted successfully!");

        // Reset form
        setQuestionTitle("");
        setQuestionDescription("");
        setTags([]);
        //console.log(result.data)
        setHackathon(result.data);
        //setDiscussions((prevDiscussions) => [...prevDiscussions, result.data]);
      } else {
        showError(result.message || "Failed to post question");
      }
    } catch (error) {
      console.error("Error posting question:", error);
      showError("An error occurred while posting your question");
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonConfig = getRegistrationButtonConfig();

  // 1️⃣ Loading state
  if (load) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="rounded-3xl p-10 text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6 animate-spin" />
          <p className="text-slate-300 font-mono tracking-wide">
            Loading hackathon...
          </p>
        </div>
      </div>
    );
  }

  // 2️⃣ Error state with Reload
  if (err) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="rounded-3xl p-10 text-center max-w-md">
          {/* Error Icon */}
          <div className="w-14 h-14 mx-auto mb-5 flex items-center justify-center rounded-full bg-red-500/10 text-red-400 text-2xl">
            ⚠️
          </div>

          {/* Error Text */}
          <h2 className="text-xl font-semibold text-red-300 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-slate-300 font-mono mb-6 break-words">
            {err} 
          </p>
          <p className="text-sm text-slate-300 font-mono mb-6 break-words">
            May be Server Error try again after few minute.
          </p>

          {/* Reload Button */}
          <button
            onClick={fetchHackathonData}
            className="px-6 py-3 rounded-xl bg-red-500/90 hover:bg-red-600 transition-all duration-200 text-white font-semibold shadow-lg shadow-red-500/30 active:scale-95"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  // 3️⃣ No hackathon found
  if (!hackathon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="rounded-3xl p-10 text-center shadow-2xl shadow-slate-500/10 backdrop-blur-xl bg-white/5 border border-white/10 max-w-md">
          {/* Empty Icon */}
          <div className="w-14 h-14 mx-auto mb-5 flex items-center justify-center rounded-full bg-slate-500/10 text-slate-400 text-2xl">
            🗂️
          </div>

          <h2 className="text-xl font-semibold text-slate-200 mb-2">
            Hackathon not found
          </h2>
          <p className="text-sm text-slate-400 font-mono">
            The hackathon you’re looking for doesn’t exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(hackathon.status);

  return (
    <div className="min-h-screen text-slate-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;900&display=swap');
        
        .font-orbitron { font-family: 'Orbitron', sans-serif; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8), 0 0 60px rgba(139, 92, 246, 0.6); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.6s ease-out forwards; }
        
        .glass-effect {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }
        
        .hover-lift {
          transition: all 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
        }
        
        .tab-active {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
          border-bottom: 2px solid #3b82f6;
        }
      `}</style>

      {/* Status Banner */}
      {registrationStatus.status !== "not_registered" && (
        <div
          className={`border-b ${
            registrationStatus.status === "registered"
              ? "bg-green-500/10 border-green-500/20"
              : registrationStatus.status === "pending"
              ? "bg-yellow-500/10 border-yellow-500/20"
              : // registrationStatus.status === 'pending' ? 'bg-orange-500/10 border-orange-500/20' :
                "bg-red-500/10 border-red-500/20"
          }`}
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {registrationStatus.status === "registered" && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
                {/* {registrationStatus.status === 'pending' && <Loader className="w-5 h-5 text-yellow-400 animate-spin" />} */}
                {registrationStatus.status === "pending" && (
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                )}
                {registrationStatus.status === "cancelled" && (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}

                <span className="font-orbitron text-sm">
                  {registrationStatus.status === "registered" &&
                    "🎉 Successfully Registered!"}
                  {registrationStatus.status === "pending" &&
                    "⏳ Registration Verification in Progress..."}
                  {/* {registrationStatus.status === 'pending_payment' && '💳 Complete Your Payment'} */}
                  {registrationStatus.status === "cancelled" &&
                    "❌ Registration Failed"}
                </span>

                {registrationStatus.message && (
                  <span className="text-sm opacity-80">
                    {registrationStatus.message}
                  </span>
                )}
              </div>

              {registrationStatus.status === "pending" && (
                <button
                  onClick={handleManualVerify}
                  disabled={statusCheckLoading}
                  className="px-4 py-1 glass-effect rounded-lg text-sm font-orbitron hover:scale-105 transition-all disabled:opacity-50"
                >
                  {statusCheckLoading ? "Checking..." : "Check Status"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-700/20 via-transparent to-transparent"></div>

        <div className="relative border-b border-blue-500/20">
          <div className="container mx-auto px-4 py-12 max-w-7xl">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-8 animate-slide-up">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-8 flex-wrap">
                  <span
                    className={`px-4 py-2 rounded-full ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color} border flex items-center gap-2 text-sm font-orbitron shadow-lg`}
                  >
                    <statusConfig.icon size={16} className="animate-pulse" />
                    {statusConfig.label}
                  </span>
                  <span className="glass-effect px-4 py-2 rounded-full text-sm font-orbitron shadow-lg">
                    ID: #{hackathon.hackathonId}
                  </span>
                  <span className="glass-effect px-4 py-2 rounded-full text-sm font-orbitron shadow-lg capitalize">
                    {hackathon.mode}
                  </span>
                </div>

                <h1 className="text-4xl lg:text-6xl font-orbitron font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-bounce">
                  {hackathon.title}
                </h1>

                <p className="text-xl text-slate-300 mb-4 leading-relaxed">
                  {hackathon.description}
                </p>

                {hackathon.extraDetail && (
                  <p className="text-slate-400 mb-6 leading-relaxed border-l-4 border-blue-500 pl-4 italic">
                    {hackathon.extraDetail}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 mb-8">
                  {hackathon.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 glass-effect rounded-full text-sm font-orbitron hover-lift cursor-pointer"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="glass-effect rounded-2xl p-6 m-auto min-w-[320px] lg:min-w-[400px] shadow-2xl shadow-blue-500/20 animate-glow">
                <h3 className="font-orbitron text-lg mb-4 text-center text-blue-400">
                  Registration Ends In
                </h3>
                <div className="grid grid-cols-4 gap-3 text-center">
                  {[
                    {
                      value: countdown.days,
                      label: "DAYS",
                      color: "text-blue-400",
                    },
                    {
                      value: countdown.hours,
                      label: "HRS",
                      color: "text-purple-400",
                    },
                    {
                      value: countdown.minutes,
                      label: "MIN",
                      color: "text-pink-400",
                    },
                    {
                      value: countdown.seconds,
                      label: "SEC",
                      color: "text-green-400",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="glass-effect rounded-xl p-3 hover-lift"
                    >
                      <div
                        className={`text-3xl font-orbitron font-bold ${item.color}`}
                      >
                        {item.value}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {isMobile && (
                <>
                  <div className="glass-effect rounded-2xl p-6 top-6 shadow-2xl shadow-blue-500/20 w-full">
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Users className="text-blue-400 animate-pulse" />
                        <span className="font-orbitron text-lg">
                          {hackathon.totalMembersJoined} 
                          {/* /{" "} */}
                          {/* {hackathon.maxRegistrations || "∞"} */}
                        </span>
                      </div>

                      <div className="w-full bg-slate-700 rounded-full h-3 mb-4 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
                          style={{
                            width: `${
                              hackathon.maxRegistrations
                                ? (hackathon.totalMembersJoined /
                                    hackathon.maxRegistrations) *
                                  100
                                : 50
                            }%`,
                          }}
                        ></div>
                      </div>

                      {hackathon.registrationFee > 0 ? (
                        <div className="flex items-center justify-center gap-2 mb-6 text-2xl">
                          <IndianRupee className="text-green-400" />
                          <span className="font-orbitron font-bold text-green-400">
                            {hackathon.registrationFee}
                          </span>
                        </div>
                      ) : (
                        <div className="text-green-400 font-orbitron text-2xl mb-6 animate-pulse">
                          FREE ENTRY
                        </div>
                      )}

                      <button
                        onClick={handleJoinClick}
                        disabled={buttonConfig.disabled || isPaymentloading}
                        className={buttonConfig.className}
                      >
                        {isPaymentloading ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <buttonConfig.icon className="w-5 h-5" />
                            <span>{buttonConfig.text}</span>
                          </>
                        )}
                      </button>

                      {/* Status Info */}
                      {registrationStatus.status === "pending" && (
                        <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                          <p className="text-yellow-400 text-sm text-center">
                            We're verifying your payment. This may take 4-8
                            hours.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 text-sm border-t border-blue-500/20 pt-6">
                      <div className="flex items-center gap-3 text-slate-300">
                        <MapPin className="text-blue-400" size={18} />
                        <span>{hackathon.venue}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                        <Users className="text-purple-400" size={18} />
                        <span>
                          Team Size: {hackathon.minParticipantsToFormTeam}-
                          {hackathon.maxTeamSize} members
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                        <Calendar className="text-pink-400" size={18} />
                        <span className="capitalize">
                          {hackathon.mode} Event
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs */}
            <div className="glass-effect rounded-2xl overflow-hidden shadow-xl">
              <div className="flex border-b border-blue-500/20 overflow-x-auto">
                {[
                  { id: "overview", label: "Overview", icon: Globe },
                  { id: "rules", label: "Rules & Criteria", icon: FileText },
                  { id: "faq", label: "FAQ", icon: AlertCircle },
                  {
                    id: "discussion",
                    label: "Discussion",
                    icon: MessageSquare,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 px-6 py-4 font-orbitron flex items-center justify-center gap-2 transition-all ${
                      activeTab === tab.id
                        ? "tab-active text-blue-400"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <tab.icon size={18} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="space-y-6 animate-slide-up">
                    {/* Schedule */}
                    <section>
                      <h2 className="text-2xl font-orbitron mb-4 text-blue-400 flex items-center gap-2">
                        <Calendar className="animate-pulse" />
                        Event Timeline
                      </h2>
                      <div className="space-y-3">
                        {[
                          {
                            icon: Calendar,
                            label: "Registration Deadline",
                            date: hackathon.registrationDeadline,
                            color: "text-red-400",
                          },
                          {
                            icon: PlayCircle,
                            label: "Hackathon Starts",
                            date: hackathon.startDate,
                            color: "text-green-400",
                          },
                          {
                            icon: XCircle,
                            label: "Hackathon Ends",
                            date: hackathon.endDate,
                            color: "text-orange-400",
                          },
                          hackathon.submissionDeadline && {
                            icon: FileText,
                            label: "Submission Deadline",
                            date: hackathon.submissionDeadline,
                            color: "text-purple-400",
                          },
                          hackathon.winnerAnnouncementDate && {
                            icon: Trophy,
                            label: "Winner Announcement",
                            date: hackathon.winnerAnnouncementDate,
                            color: "text-yellow-400",
                          },
                        ]
                          .filter(Boolean)
                          .map((item: any, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between glass-effect p-4 rounded-xl hover-lift"
                            >
                              <div className="flex items-center gap-3">
                                <item.icon className={item.color} size={20} />
                                <span className="font-medium">
                                  {item.label}
                                </span>
                              </div>
                              <span className="font-orbitron text-slate-300">
                                {new Date(item.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                          ))}
                      </div>
                    </section>

                    {/* Submission Format */}
                    {hackathon.submissionFormat && (
                      <section className="glass-effect p-6 rounded-xl border-l-4 border-purple-500">
                        <h3 className="font-orbitron text-lg mb-3 text-purple-400 flex items-center gap-2">
                          <FileText size={20} />
                          Submission Format
                        </h3>
                        <p className="text-slate-300">
                          {hackathon.submissionFormat}
                        </p>
                      </section>
                    )}

                    {/* Prizes */}
                    <section>
                      <h2 className="text-2xl font-orbitron mb-4 text-yellow-400 flex items-center gap-2">
                        <Trophy className="animate-bounce" />
                        Prizes & Rewards
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {hackathon.prizes.map((prize, index) => (
                          <div
                            key={index}
                            className="glass-effect p-6 rounded-xl text-center border-2 border-transparent hover:border-blue-500/50 hover-lift"
                          >
                            <Trophy
                              className={`w-12 h-12 mx-auto mb-4 ${
                                index === 0
                                  ? "text-yellow-400 animate-bounce"
                                  : index === 1
                                  ? "text-slate-400"
                                  : "text-orange-400"
                              }`}
                            />
                            <h3 className="font-orbitron text-xl mb-2">
                              {prize.position} Place
                            </h3>
                            <div className="text-3xl font-orbitron font-bold text-green-400 mb-2">
                              ₹{prize.amount.toLocaleString()}
                            </div>
                            {prize.rewards && (
                              <p className="text-slate-400 text-sm mt-2">
                                {prize.rewards}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Evaluation Criteria */}
                    {hackathon.evaluationCriteria &&
                      hackathon.evaluationCriteria.length > 0 && (
                        <section>
                          <h2 className="text-2xl font-orbitron mb-4 text-pink-400 flex items-center gap-2">
                            <Target className="animate-pulse" />
                            Evaluation Criteria
                          </h2>
                          <div className="space-y-3">
                            {hackathon.evaluationCriteria.map(
                              (criteria, index) => (
                                <div
                                  key={index}
                                  className="glass-effect p-4 rounded-xl"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-orbitron">
                                      {criteria.criterion}
                                    </span>
                                    <span className="text-blue-400 font-bold">
                                      {criteria.weight}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div
                                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                                      style={{ width: `${criteria.weight}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </section>
                      )}
                  </div>
                )}

                {/* Rules Tab */}
                {activeTab === "rules" && (
                  <div className="space-y-6 animate-slide-up">
                    <section>
                      <h2 className="text-2xl font-orbitron mb-4 text-red-400 flex items-center gap-2">
                        <AlertCircle className="animate-pulse" />
                        Hackathon Rules
                      </h2>
                      <div className="space-y-3">
                        {hackathon.rules.map((rule, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 glass-effect p-4 rounded-xl hover-lift"
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                              <span className="text-blue-400 font-orbitron font-bold">
                                {index + 1}
                              </span>
                            </div>
                            <p className="text-slate-300 flex-1">{rule}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                )}

                {/* FAQ Tab */}
                {activeTab === "faq" && (
                  <div className="space-y-4 animate-slide-up">
                    <h2 className="text-2xl font-orbitron mb-4 text-purple-400 flex items-center gap-2">
                      <AlertCircle className="animate-pulse" />
                      Frequently Asked Questions
                    </h2>
                    {hackathon.faqs.map((faq, index) => (
                      <div
                        key={index}
                        className="glass-effect rounded-xl overflow-hidden hover-lift"
                      >
                        <button
                          onClick={() =>
                            setExpandedFaq(expandedFaq === index ? null : index)
                          }
                          className="w-full p-4 text-left flex items-center justify-between hover:bg-blue-500/5 transition-all"
                        >
                          <span className="font-orbitron text-blue-400">
                            {faq.question}
                          </span>
                          {expandedFaq === index ? (
                            <ChevronUp className="text-blue-400" />
                          ) : (
                            <ChevronDown className="text-slate-400" />
                          )}
                        </button>
                        {expandedFaq === index && (
                          <div className="p-4 pt-0 text-slate-300 border-t border-blue-500/20 animate-slide-up">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Discussion Tab */}
                {activeTab === "discussion" && (
                  <div className="space-y-6 animate-slide-up">
                    <h2 className="text-2xl font-orbitron mb-4 text-green-400 flex items-center gap-2">
                      <MessageSquare className="animate-pulse" />
                      Q&A Discussion
                    </h2>

                    {/* Ask Question */}
                    <div className="glass-effect p-4 rounded-xl">
                      <textarea
                        value={questionTitle}
                        onChange={(e) => setQuestionTitle(e.target.value)}
                        placeholder="Ask a question about the hackathon..."
                        className="w-full bg-slate-900/50 border border-blue-500/20 rounded-lg p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
                        rows={3}
                      />
                      <button
                        onClick={handleAskQuestion}
                        className="mt-3 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-orbitron flex items-center gap-2 hover:scale-105 transition-all"
                      >
                        <Send size={16} />
                        Ask Question
                      </button>
                    </div>

                    {/* Discussion List */}
                    <div className="space-y-4">
                      {hackathon.discussions.map((discussion) => (
                        <div
                          key={discussion._id}
                          className="glass-effect p-5 rounded-xl hover-lift"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-orbitron text-white text-sm flex-shrink-0">
                              <img
                                className="rounded-full"
                                src={discussion.user.profilePicture}
                                alt=""
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-orbitron text-blue-400">
                                  {discussion.user.name}
                                </span>
                                <span className="text-slate-500 text-sm">
                                  {discussion.timestamp}
                                </span>
                              </div>
                              <p className="text-slate-300 mb-3">
                                {discussion.title}
                              </p>
                              {discussion.content && (
                                <div className="bg-blue-500/10 border-l-4 border-blue-500 p-3 rounded-lg mb-3">
                                  <div className="text-sm text-blue-400 mb-1 font-orbitron">
                                    Answer:
                                  </div>
                                  <p className="text-slate-300">
                                    {discussion.content}
                                  </p>
                                </div>
                              )}
                              <div className="flex items-center gap-4 text-sm text-slate-400">
                                <button className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                                  <ThumbsUp size={14} />
                                  {discussion.likes}
                                </button>
                                <button className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                                  <MessageSquare size={14} />
                                  {discussion.replies.length} replies
                                </button>
                              </div>

                              {/* Replies Section */}
                              {discussion.replies.length > 0 && (
                                <div className="mt-4 space-y-3 border-t border-slate-700 pt-4">
                                  <h4 className="font-orbitron text-sm text-slate-400 mb-2">
                                    Replies ({discussion.replies.length})
                                  </h4>
                                  {discussion.replies.map((reply) => (
                                    <div
                                      key={reply._id}
                                      className="flex items-start gap-3 bg-slate-800/30 p-3 rounded-lg"
                                    >
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center font-orbitron text-white text-xs flex-shrink-0">
                                        <img
                                          className="rounded-full"
                                          src={reply.user.profilePicture}
                                          alt=""
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="font-orbitron text-green-400 text-sm">
                                            {reply.user.name}
                                          </span>
                                          <span className="text-slate-500 text-xs">
                                            {reply.timestamp}
                                          </span>
                                        </div>
                                        <p className="text-slate-300 text-sm">
                                          {reply.content}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                                          <button className="flex items-center gap-1 hover:text-green-400 transition-colors">
                                            <ThumbsUp size={12} />
                                            {reply.likes}
                                          </button>
                                          <button
                                            className="hover:text-green-400 transition-colors"
                                            // onClick={() =>
                                            //   handleReplyDiscussion(
                                            //     discussion._id
                                            //   )
                                            // }
                                          >
                                            Reply
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Add Reply Input */}
                              <div className="mt-4 flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Add a reply..."
                                  onChange={(e) =>
                                    setReplyContent(e.target.value)
                                  }
                                  className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
                                />
                                <button
                                  onClick={() =>
                                    handleReplyDiscussion(discussion._id)
                                  }
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-orbitron transition-colors"
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Problem Statements - Only shown during hackathon */}
            {hackathon.status === "ongoing" && (
              <section className="glass-effect rounded-2xl p-6 shadow-xl animate-slide-up">
                <h2 className="text-2xl font-orbitron mb-6 text-blue-400 flex items-center gap-2">
                  <Target className="animate-pulse" />
                  Problem Statements
                </h2>
                <div className="grid gap-4">
                  {hackathon.problemStatements.map((statement, index) => (
                    <div
                      key={index}
                      className="glass-effect p-5 rounded-xl border-l-4 border-blue-500 hover-lift"
                    >
                      <h3 className="font-orbitron text-lg mb-2 text-purple-400">
                        Challenge {index + 1}
                      </h3>
                      <p className="text-slate-300">{statement}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}

            {!isMobile && (
              <>
                <div className="glass-effect rounded-2xl p-6 top-6 shadow-2xl shadow-blue-500/20">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Users className="text-blue-400 animate-pulse" />
                      <span className="font-orbitron text-lg">
                        {hackathon.totalMembersJoined} 
                        {/* /{" "} */}
                          {/* {hackathon.maxRegistrations || "∞"} */}
                      </span>
                    </div>

                    <div className="w-full bg-slate-700 rounded-full h-3 mb-4 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
                        style={{
                          width: `${
                            hackathon.maxRegistrations
                              ? (hackathon.totalMembersJoined /
                                  hackathon.maxRegistrations) *
                                100
                              : 50
                          }%`,
                        }}
                      ></div>
                    </div>

                    {hackathon.registrationFee > 0 ? (
                      <div className="flex items-center justify-center gap-2 mb-6 text-2xl">
                        <IndianRupee className="text-green-400" />
                        <span className="font-orbitron font-bold text-green-400">
                          {hackathon.registrationFee}
                        </span>
                      </div>
                    ) : (
                      <div className="text-green-400 font-orbitron text-2xl mb-6 animate-pulse">
                        FREE ENTRY
                      </div>
                    )}

                    <button
                      onClick={handleJoinClick}
                      disabled={buttonConfig.disabled || isPaymentloading}
                      className={buttonConfig.className}
                    >
                      {isPaymentloading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <buttonConfig.icon className="w-5 h-5" />
                          <span>{buttonConfig.text}</span>
                        </>
                      )}
                    </button>

                    {/* Status Info */}
                    {registrationStatus.status === "pending" && (
                      <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <p className="text-yellow-400 text-sm text-center">
                          We're verifying your payment. This may take 4-8 hours.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 text-sm border-t border-blue-500/20 pt-6">
                    <div className="flex items-center gap-3 text-slate-300">
                      <MapPin className="text-blue-400" size={18} />
                      <span>{hackathon.venue}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <Users className="text-purple-400" size={18} />
                      <span>
                        Team Size: {hackathon.minParticipantsToFormTeam}-
                        {hackathon.maxTeamSize} members
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <Calendar className="text-pink-400" size={18} />
                      <span className="capitalize">{hackathon.mode} Event</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Requirements */}
            <div className="glass-effect rounded-2xl p-6 shadow-xl hover-lift">
              <h3 className="font-orbitron text-lg mb-4 text-blue-400 flex items-center gap-2">
                <CheckCircle className="animate-pulse" />
                Requirements
              </h3>
              <ul className="space-y-3">
                {hackathon.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
                    <span className="text-slate-300 text-sm">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Organizer */}
            <div className="glass-effect rounded-2xl p-6 shadow-xl hover-lift">
              <h3 className="font-orbitron text-lg mb-4 text-purple-400 flex items-center gap-2">
                <Building2 className="animate-pulse" />
                Organizer
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <Award className="text-yellow-400" size={16} />
                  <span className="font-orbitron text-sm">
                    {hackathon.organizer.organization}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Users className="text-blue-400" size={16} />
                  <span className="text-sm">{hackathon.organizer.name}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="text-green-400" size={16} />
                  <a
                    href={`mailto:${hackathon.organizer.contactEmail}`}
                    className="text-sm hover:text-blue-400 transition-colors"
                  >
                    {hackathon.organizer.contactEmail}
                  </a>
                </div>
                {hackathon.organizer.contactNumber && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="text-purple-400" size={16} />
                    <span className="text-sm">
                      {hackathon.organizer.contactNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            {hackathon.socialLinks &&
              Object.values(hackathon.socialLinks).some((link) => link) && (
                <div className="glass-effect rounded-2xl p-6 shadow-xl hover-lift">
                  <h3 className="font-orbitron text-lg mb-4 text-pink-400 flex items-center gap-2">
                    <Globe className="animate-pulse" />
                    Connect With Us
                  </h3>
                  <div className="space-y-3">
                    {hackathon.socialLinks.website && (
                      <a
                        href={hackathon.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-slate-300 hover:text-blue-400 transition-colors"
                      >
                        <ExternalLink size={16} className="text-blue-400" />
                        <span className="text-sm">Website</span>
                      </a>
                    )}
                    {hackathon.socialLinks.linkedin && (
                      <a
                        href={hackathon.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-slate-300 hover:text-blue-400 transition-colors"
                      >
                        <Linkedin size={16} className="text-blue-600" />
                        <span className="text-sm">LinkedIn</span>
                      </a>
                    )}
                    {hackathon.socialLinks.twitter && (
                      <a
                        href={hackathon.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-slate-300 hover:text-blue-400 transition-colors"
                      >
                        <Twitter size={16} className="text-blue-400" />
                        <span className="text-sm">Twitter</span>
                      </a>
                    )}
                    {hackathon.socialLinks.discord && (
                      <a
                        href={hackathon.socialLinks.discord}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-slate-300 hover:text-blue-400 transition-colors"
                      >
                        <MessageSquare size={16} className="text-indigo-400" />
                        <span className="text-sm">Discord Community</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Fee Modal */}
      {showFeeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-blue-500/30 border-2 border-blue-500/30">
            <h3 className="font-orbitron text-2xl mb-4 text-blue-400">
              Registration Fee
            </h3>
            <p className="text-slate-300 mb-6 leading-relaxed">
              This hackathon requires a registration fee of{" "}
              <span className="font-orbitron text-2xl text-green-400 font-bold">
                ₹{hackathon.registrationFee}
              </span>
              .
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowFeeModal(false)}
                className="flex-1 py-3 px-4 glass-effect rounded-xl font-orbitron hover:bg-slate-700/50 transition-all border border-slate-600/50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowFeeModal(false);
                  setShowPaymentModal(true);
                  setShowFreeRegistrationModal(true);
                }}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-orbitron hover:scale-105 transition-all shadow-lg shadow-blue-500/50"
              >
                Pay ₹{hackathon.registrationFee}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {/* {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal} 
          onClose={() => setShowPaymentModal(false)}
          registrationFee={hackathon.registrationFee}
          hackathonName={hackathon.title}
          hackathonId={hackathon.hackathonId}
          userEmail={getUserEmail()}
          onPaymentSuccess={handlePaymentSuccess}
          existingOrderId={registrationStatus.orderId}
        />
      )} */}
      {showFreeRegistrationModal && (
        <HandleFreeRegistration
          isOpen={showFreeRegistrationModal}
          onClose={() => setShowFreeRegistrationModal(false)}
          registrationFee={hackathon.registrationFee}
          hackathonName={hackathon.title}
          hackathonId={hackathon.hackathonId}
          userEmail={getUserEmail()}
          onPaymentSuccess={handlePaymentSuccess}
          existingOrderId={registrationStatus.orderId}
        />
      )}
    </div>
  );
};

export default CyberHackathonDetail;

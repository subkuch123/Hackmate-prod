import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth, useUser } from "./hooks/authHook";
import { verifyToken } from "./store/slices/authSlice";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Landing from "./pages/Basic/Landing";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Dashboard from "./pages/Auth/Dashboard";
import Lobbies from "./pages/SearchLobby";
import TeamsStatusPage from "./pages/TeamsStatusPage";
import Profile from "./pages/Auth/Profile";
import Analytics from "./pages/Basic/Analytics";
import Settings from "./pages/Auth/Settings";
import NotFound from "./pages/Basic/NotFound";
import { useEffect, useState } from "react";
import ScrollToTop from "./components/layout/scroll-to-top";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import FeedbackForm from "./pages/Basic/Feedback";
// import HackathonDetailsPage from "./pages/NotReg/Hackathon";
import { userFetchHackathon } from "./store/slices/userCurrrentHacthon";
import OnGoingHackthonPage from "./pages/OnGoingHackthonPage";
import Loader from "./components/ui/Loader";
import HackMateDonationPage from "./pages/Basic/Donation";
import { BackgroundScene } from "./components/3d/background-scene";
import CyberHackathonDetail from "./pages/HackathonDetailPage";
import Swag from "./pages/Basic/Swag";
import HackathonFeedbackForm from "./pages/Feedback/HackathonFeedbackForm";
// import NotificationContainer from "./components/NotificationContainer";

// import NotificationStickyHeader from "./components/notification/NotificationStickyHeader";
import TermsOfService from "./pages/Basic/Terms";
import About from "./pages/Basic/About";
import ChatWidget from "./components/chat/ChatWidget";
import PrivacyPolicy from "./pages/Basic/Privacy";
import ContactUs from "./pages/Basic/ContactUs";
import AnimationPageLayout from "./pages/Animation/AnimationPageLayout";
import KaramSanketPage from "./pages/Details/KaramSanketDetailPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, dispatch, message } = useAuth();
  const { user } = useUser();
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const checkToken = async () => {
      try {
        if (token) {
          await dispatch(verifyToken());
        }
      } catch (error) {
        console.error("Token verification error:", error);
        // Clear invalid token
        localStorage.removeItem("token");
      } finally {
        // Always stop bootstrapping after token check (success or failure)

        //setTimeout(() => {
        setIsBootstrapping(false);
        //}, 4000);
        // setIsBootstrapping(false);
      }
    };

    checkToken();
  }, [dispatch]);

  useEffect(() => {
    if (user && user?.currentHackathonId) {
      dispatch(userFetchHackathon(user.currentHackathonId));
    }
  }, [user, user?.currentHackathonId, dispatch]);

  // Show loader only during initial app bootstrap, not during normal auth loading
  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // setTimeout(() => {
  //   NotificationContainer.addNotification({
  //     _id: "2",
  //     title: "New Hackathon Announcement",
  //     message: "Cyber Security Challenge 2024 is now open!",
  //     description: "Register your team before the deadline",
  //     position: "SIDE_BOTTOM_RIGHT",
  //     duration: { type: "FIXED", timer: 10000 },
  //     type: "HACKATHON",
  //     priority: "MEDIUM",
  //     action: {
  //       type: "REDIRECT",
  //       url: "/hackathons/cyber-security-2024",
  //     },
  //     createdAt: new Date(),
  //   });
  // }, 5000);

  return (
    <Router>
      <ScrollToTop />

      <div className="min-h-screen text-foreground relative">
        {/* HACK I THINK ERRORR INTO THIS THING  */}
        <AnimationPageLayout />
        <BackgroundScene className="absolute inset-0 w-full h-full" />

        <Navbar />
        {/* <NotificationStickyHeader /> */}
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/lobbies"
              element={isAuthenticated ? <Lobbies /> : <Navigate to="/login" />}
            />
            <Route
              path="/teams"
              element={isAuthenticated ? <TeamsStatusPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/analytics"
              element={
                isAuthenticated ? <Analytics /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/profile"
              element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
            />
            <Route
              path="/settings"
              element={
                isAuthenticated ? <Settings /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/hackathon/:id"
              element={
                isAuthenticated ? (
                  <CyberHackathonDetail />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route path="/team" element={<OnGoingHackthonPage />} />
            </Route>
            <Route path="/donation" element={<HackMateDonationPage />} />
            <Route path="/swag" element={<Swag />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/feedback" element={<HackathonFeedbackForm />} />
            <Route path="/feedback2" element={<FeedbackForm />} />
            <Route path="/event/karam-sankt" element={<KaramSanketPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          {/* <NotificationContainer /> */}
          <ChatWidget />
        </main>
        <Footer />
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return <AppContent />;
};

export default App;

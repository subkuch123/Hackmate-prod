import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { useUser } from "@/hooks/authHook";
import { motion } from "framer-motion";
import HackMateLogo from "@/assets/logo-test.png";
import blueman from "@/assets/blueman.gif";
import whiteman from "@/assets/whiteman.gif";
import { useNavigate } from "react-router-dom";
import { GuidelinesModal } from "@/components/Guidelines";
import {Sponsor}from "@/components/Sponsor";

import {
  ArrowRight,
  Users,
  Zap,
  Trophy,
  Sparkles,
  Brain,
  Rocket,
  Code,
  Crown,
  Gem,
  Award,
  Sparkle,
  Heart,
  CircuitBoard,
  Calendar,
  Clock,
  Globe,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Randomized Team",
    description:
      "🎲 We create teams randomly to give every participant a fair chance. This builds confidence, encourages new connections, and eliminates the stress of finding teammates!",
    color: "from-blue-500 to-cyan-500",
    delay: 0.1,
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "⚡ Experience a 36-hour coding sprint packed with nonstop energy, creativity, and breakthroughs. Push your limits and watch ideas come to life!",
    color: "from-purple-500 to-pink-500",
    delay: 0.2,
  },
  {
    icon: Trophy,
    title: "Amazing Prizes",
    description:
      "🏆 Compete for cash rewards, cutting-edge tech, and career-boosting opportunities. Every project is a chance to shine and get recognized!",
    color: "from-yellow-500 to-orange-500",
    delay: 0.3,
  },
  {
    icon: Sparkles,
    title: "Exclusive Swags",
    description:
      "🎁 Take home limited edition merchandise — hoodies, T-shirts, stickers, and more to show off your Hackmate pride!",
    color: "from-green-500 to-teal-500",
    delay: 0.4,
  },
];

const timeline = [
  {
    phase: "Registration",
    date: "20 Dec 25 (9:00 PM) - 16 Jan 26 (11:59 PM)",
    description:
      "📝 Sign up, create your Hackmate profile, and tell us about your interests and skills. This helps us form balanced teams for the ultimate hackathon experience!",
    icon: Users,
    status: "upcoming",
  },
  {
    phase: "Team Formation",
    date: "17 Jan 26 (2:00 AM) ",
    description:
      "🎉 Get ready to meet your new team! We form teams randomly to give everyone a fair chance to collaborate, build confidence, and eliminate the stress of finding teammates.",
    icon: Brain,
    status: "upcoming",
  },
  {
    phase: "Hackathon Kickoff",
    date: "17 Jan 26 (9:00 AM – 9:45 AM)",
    description:
      "🚀 Get ready for liftoff! Join the opening ceremony, explore the hackathon theme, and attend orientation sessions to understand problem statements and judging criteria.",
    icon: Rocket,
    status: "upcoming",
  },
  {
    phase: "Coding Sprint",
    date: "17 Jan 26 (10:00 AM) – 18 Jan 26 (10:00 PM)",
    description:
      "💻 Dive into 36 hours of intense coding, designing, and innovating with your team. Collaborate, build, and push your limits to bring your hackathon idea to life!",
    icon: Code,
    status: "upcoming",
  },
  {
    phase: "Judging & Awards",
    date: "28 Jan 26 (7:00 PM)",
    description:
      "🏆 Showcase your final project to expert judges and industry leaders. Get recognized for creativity, innovation, and teamwork — and celebrate the champions of Hackmate!",
    icon: Trophy,
    status: "upcoming",
  },
];
const prizes = [
  {
    tier: "Winner",
    amount: "₹25,000",
    description:
      "🏆 ₹25,000 cash prize, Pre-Placement Interview opportunity, winner trophy, certificate, and exclusive goodies.",
    icon: Crown,
    color: "from-yellow-400 to-orange-500",
  },
  {
    tier: "First Runner-Up",
    amount: "₹15,000",
    description:
      "🥈 ₹15,000 cash prize, Pre-Placement Interview opportunity, trophy, certificate, and exciting goodies.",
    icon: Gem,
    color: "from-gray-400 to-gray-600",
  },
  {
    tier: "Second Runner-Up",
    amount: "₹10,000",
    description:
      "🥉 ₹10,000 cash prize, Pre-Placement Interview opportunity, trophy, certificate, and goodies.",
    icon: Award,
    color: "from-amber-500 to-amber-700",
  },
  {
    tier: "Top 10 Teams",
    amount: "Vouchers & Goodies",
    description:
      "🎁 Free subscriptions, Swiggy coupons, exciting vouchers, certificates, and partner goodies.",
    icon: Sparkle,
    color: "from-purple-500 to-pink-500",
  },
  {
    tier: "Top 3 Female Coders",
    amount: "Special Rewards",
    description:
      "👩‍💻 Special recognition, exclusive career opportunities, certificates, and trophies.",
    icon: Sparkle,
    color: "from-rose-400 to-pink-600",
  },
  {
    tier: "Sponsor Rewards",
    amount: "Worth ₹2,00,000+",
    description:
      "🤝 ₹5,000 InterviewBuddy coupons for Top 10, free courses & discounts from NDT SPTOS, and ₹1.5 lakh Wireframe platform credits.",
    icon: Sparkle,
    color: "from-cyan-400 to-blue-500",
  },
];


const swags = [
  {
    item: "Exclusive Hoodie",
    description:
      "Cyberpunk-designed hoodie with neon accents and Hackmate logo",
    icon: Heart,
  },
  {
    item: "Hackmate T-Shirt",
    description:
      "Comfort-fit cotton T-shirt with glow-in-the-dark Hackmate print",
    icon: Award,
  },
  {
    item: "Custom Badge",
    description:
      "Exclusive Hackmate name badge with neon lanyard for all participants",
    icon: CircuitBoard,
  },
  {
    item: "Sticker Pack",
    description: "Collection of hacker-themed and motivational tech stickers",
    icon: Zap,
  },
];

export default function HackathonLanding() {
  const { user } = useUser();
  const containerRef = useRef(null);
  const [sparkleCount, setSparkleCount] = useState(30);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const navigate = useNavigate();
  const handleViewGuidelines = () => {
    setShowGuidelines(true);
  };

  const handleRegister = () => {
    if (!user) {
      navigate("/login");
      console.log("8. After navigate call");
    } else {
      navigate("/dashboard");
      console.log("9. User is logged in, proceeding with registration");
    }
  };

  // Adjust sparkle count based on screen size
  useEffect(() => {
    const updateSparkleCount = () => {
      if (window.innerWidth < 768) {
        setSparkleCount(10);
      } else {
        setSparkleCount(20);
      }
    };

    updateSparkleCount();
    window.addEventListener("resize", updateSparkleCount);

    return () => window.removeEventListener("resize", updateSparkleCount);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Full Screen Sparkles Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <style>
          {`
                    @keyframes sparkleMove {
                        0% {
                            transform: translate(0, 0) scale(0);
                            opacity: 0;
                        }
                        10% {
                            transform: translate(${
                              Math.random() * 100 - 50
                            }px, ${Math.random() * 100 - 50}px) scale(0.5);
                            opacity: 0.8;
                        }
                        20% {
                            transform: translate(${
                              Math.random() * 200 - 100
                            }px, ${Math.random() * 200 - 100}px) scale(1);
                            opacity: 1;
                        }
                        30% {
                            transform: translate(${
                              Math.random() * 300 - 150
                            }px, ${Math.random() * 300 - 150}px) scale(1.2);
                            opacity: 0.9;
                        }
                        40% {
                            transform: translate(${
                              Math.random() * 400 - 200
                            }px, ${Math.random() * 400 - 200}px) scale(1.5);
                            opacity: 0.7;
                        }
                        50% {
                            transform: translate(${
                              Math.random() * 500 - 250
                            }px, ${Math.random() * 500 - 250}px) scale(1.8);
                            opacity: 0.5;
                        }
                        60% {
                            transform: translate(${
                              Math.random() * 600 - 300
                            }px, ${Math.random() * 600 - 300}px) scale(2);
                            opacity: 0.3;
                        }
                        70% {
                            transform: translate(${
                              Math.random() * 700 - 350
                            }px, ${Math.random() * 700 - 350}px) scale(2.2);
                            opacity: 0.2;
                        }
                        80% {
                            transform: translate(${
                              Math.random() * 800 - 400
                            }px, ${Math.random() * 800 - 400}px) scale(2.5);
                            opacity: 0.1;
                        }
                        90% {
                            transform: translate(${
                              Math.random() * 900 - 450
                            }px, ${Math.random() * 900 - 450}px) scale(2.8);
                            opacity: 0;
                        }
                        100% {
                            transform: translate(${
                              Math.random() * 1000 - 500
                            }px, ${Math.random() * 1000 - 500}px) scale(3);
                            opacity: 0;
                        }
                    }

                    @keyframes simpleSparkle {
                        0% {
                            transform: translate(0, 0) scale(0);
                            opacity: 0;
                        }
                        25% {
                            transform: translate(${
                              Math.random() * 200 - 100
                            }px, ${Math.random() * 200 - 100}px) scale(1);
                            opacity: 1;
                        }
                        50% {
                            transform: translate(${
                              Math.random() * 400 - 200
                            }px, ${Math.random() * 400 - 200}px) scale(1.5);
                            opacity: 0.8;
                        }
                        75% {
                            transform: translate(${
                              Math.random() * 600 - 300
                            }px, ${Math.random() * 600 - 300}px) scale(2);
                            opacity: 0.3;
                        }
                        100% {
                            transform: translate(${
                              Math.random() * 800 - 400
                            }px, ${Math.random() * 800 - 400}px) scale(2.5);
                            opacity: 0;
                        }
                    }

                    @media (max-width: 768px) {
                        .sparkle {
                            animation-name: simpleSparkle !important;
                        }
                    }
                    `}
        </style>

        {Array.from({ length: sparkleCount }).map((_, index) => (
          <div
            key={index}
            className="sparkle absolute pointer-events-none"
            style={{
              left: `${Math.random() * 100}vw`,
              top: `${Math.random() * 100}vh`,
              width: `${Math.random() * 3 + 2}px`,
              height: `${Math.random() * 3 + 2}px`,
              background:
                "radial-gradient(circle, #FFD700 0%, rgba(255,215,0,0) 70%)",
              borderRadius: "50%",
              animation: `sparkleMove ${
                Math.random() * 4 + 3
              }s linear infinite ${Math.random() * 5}s`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div ref={containerRef} className="relative w-full mx-auto overflow-x-hidden max-w-7xl">
        {/* Hero Section */}
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="container mx-auto px-4 text-center relative z-10 max-w-5xl">
            {/* Logo + GIFs + Title Overlay */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 1.5 }}
              className="mb-6 sm:mb-8"
            >
              <div className="relative mx-auto max-w-2xl rounded-3xl overflow-hidden ">
                {/* GIFs wrapper */}
                <div className="flex h-full w-full">
                  <img
                    src={blueman}
                    className="h-full w-1/2 object-cover"
                    loading="lazy"
                    alt="Code battle animation left"
                  />
                  <img
                    src={whiteman}
                    className="h-full w-1/2 object-cover"
                    loading="lazy"
                    alt="Code battle animation right"
                  />
                </div>

                {/* CODEYUDH text overlay ON the GIFs */}
                <div className="absolute inset-0 flex items-center justify-center px-4">
                  <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight">
                    <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(56,189,248,0.75)]">
                      CODEYUDH
                    </span>
                  </h1>
                </div>
              </div>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-base sm:text-lg md:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-2"
            >
              The Ultimate Hackathon Experience
            </motion.p>

            {/* Event Details */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-5 md:p-6 mb-6 sm:mb-8 max-w-3xl mx-auto border border-white/15 shadow-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-center">
                <div className="space-y-1.5 sm:space-y-2">
                  <Calendar className="w-6 h-6 md:w-8 md:h-8 mx-auto text-cyan-400" />
                  <p className="text-xs sm:text-sm text-gray-400">DATE</p>
                  <p className="text-sm sm:text-base md:text-lg font-semibold text-white">
                   20 Dec 2025 - 28 Jan 26
                  </p>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Clock className="w-6 h-6 md:w-8 md:h-8 mx-auto text-purple-400" />
                  <p className="text-xs sm:text-sm text-gray-400">DURATION</p>
                  <p className="text-sm sm:text-base md:text-lg font-semibold text-white">
                    36 Hours
                  </p>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Globe className="w-6 h-6 md:w-8 md:h-8 mx-auto text-pink-400" />
                  <p className="text-xs sm:text-sm text-gray-400">LOCATION</p>
                  <p className="text-sm sm:text-base md:text-lg font-semibold text-white">
                    Virtual
                  </p>
                </div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-2"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 md:px-8 py-3 text-sm sm:text-base md:text-lg font-semibold rounded-full hover:shadow-[0_0_35px_rgba(56,189,248,0.4)] hover:-translate-y-0.5 transition-all duration-200 border border-cyan-400/40"
                onClick={handleRegister}
              >
                <Zap className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Register Now
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
              </Button>
              {/* Optional second button */}
              {/* 
      <Button
        variant="outline"
        size="lg"
        className="w-full sm:w-auto bg-transparent border-cyan-400/60 text-cyan-300 px-6 md:px-8 py-3 text-sm sm:text-base md:text-lg font-semibold rounded-full hover:bg-cyan-400/10"
      >
        Learn More
      </Button> 
      */}
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <div className="py-16 md:py-20 relative">
          <div className="container mx-auto px-4 max-w-full">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 md:mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 font-sans">
                About <span className="text-cyan-400">CodeYudh</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto px-4">
                Experiences the future of hackathons with our revolutionary team
                matching system. We connect brilliant minds to create
                extraordinary solutions.
              </p>
            </motion.div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
  <motion.div
    initial={{ opacity: 0, x: -50 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8 }}
    className="relative"
  >
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 md:p-8 h-full border border-white/20">
      <div className="flex flex-col h-full">
        <p className="text-lg sm:text-xl md:text-2xl font-semibold text-cyan-400 text-center mb-3 sm:mb-4">
          Team Assembly: More Coding, Less Hassle
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 flex-grow">
          {/* Random 3-Student Teams */}
          <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
              <h4 className="text-white font-semibold text-sm sm:text-base leading-tight">
                Random 3-Student Teams
              </h4>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Teams are{" "}
              <span className="text-cyan-300 font-semibold">randomly assigned</span>{" "}
              (3 members) to save time, ensure{" "}
              <span className="text-cyan-300 font-semibold">collaboration</span>{" "}
              among diverse peers, and dramatically broaden your network and skill exposure.
            </p>
          </div>

          {/* Actionable Post-Event Feedback */}
          <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300 flex-shrink-0" />
              <h4 className="text-white font-semibold text-sm sm:text-base leading-tight">
                Actionable Post-Event Feedback
              </h4>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Win or lose, you get a{" "}
              <span className="text-cyan-300 font-semibold">detailed analysis</span>{" "}
              of your work. We highlight your{" "}
              <span className="text-cyan-300 font-semibold">strengths and weak spots</span>{" "}
              for clear, immediate improvement.
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-gray-400 mt-auto text-center">
          Our structure ensures that every student gets{" "}
          <span className="text-emerald-300">
            optimal contribution time and personalized growth feedback.
          </span>
        </p>
      </div>
    </div>
  </motion.div>

  {/* Second Box */}
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8 }}
    className="relative"
  >
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 md:p-8 h-full border border-white/20">
      <div className="flex flex-col h-full">
        <p className="text-lg sm:text-xl md:text-2xl font-semibold text-cyan-400 text-center mb-3 sm:mb-4">
          The Unique Challenges That Define Us
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 flex-grow">
          {/* Mid-Hack Critical Pressure Test */}
          <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 flex-shrink-0" />
              <h4 className="text-white font-semibold text-sm sm:text-base leading-tight">
                Mid-Hack Critical Pressure Test
              </h4>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Surprise task dropped during the hackathon to test{" "}
              <span className="text-cyan-300">composure, adaptability</span>{" "}
              and{" "}
              <span className="text-cyan-300">collaboration under time,</span>{" "}
              ultimately revealing team character and forging excellence.
            </p>
          </div>

          {/* The KarmSankat Dilemma */}
          <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300 flex-shrink-0" />
              <h4 className="text-white font-semibold text-sm sm:text-base leading-tight">
                The KarmSankat Dilemma
              </h4>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Teams face a tough call: who would you{" "}
              <span className="text-cyan-300">bench</span> based on transparent{" "}
              <span className="text-cyan-300">impact & ownership</span> metrics? 
              Survive the dilemma → earn{" "}
              <span className="text-emerald-300">bonus points & perks</span>.
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-gray-400 mt-auto text-center">
          Teams that navigate both challenges effectively unlock{" "}
          <span className="text-emerald-300">extra rewards & prize boosts</span>{" "}
          securing a decisive & prestigious edge.
        </p>
      </div>
    </div>
  </motion.div>
</div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 md:py-20 relative">
          <div className="container mx-auto px-4 max-w-full">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 md:mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 font-sans">
                Why <span className="text-cyan-400">CodeYudh</span>?
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: feature.delay }}
                  whileHover={{ y: -5 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20 group cursor-pointer"
                >
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-3 md:mb-4`}
                  >
                    <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-white group-hover:text-cyan-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 text-sm md:text-base">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Prizes Section */}
        <div className="py-16 md:py-20 relative">
          <div className="container mx-auto px-4 max-w-full">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 md:mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 font-sans">
                Amazing <span className="text-yellow-400">Prizes</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-4">
                Compete for incredible rewards and recognition in the tech
                community
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
              {prizes.map((prize, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center relative overflow-hidden"
                >
                  <div
                    className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${prize.color}`}
                  />
                  <div
                    className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${prize.color} flex items-center justify-center mb-4`}
                  >
                    <prize.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-white">
                    {prize.tier}
                  </h3>
                  <p className="text-3xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                    {prize.amount}
                  </p>
                  <p className="text-gray-300">{prize.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Swags Section */}
        <div className="py-16 md:py-20 relative">
          <div className="container mx-auto px-4 max-w-full">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 md:mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 font-sans">
                Exclusive <span className="text-pink-400">Swags</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-4">
                Every participant gets awesome merchandise to remember the
                experience
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
              {swags.map((swag, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center group"
                >
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mb-4">
                    <swag.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">
                    {swag.item}
                  </h3>
                  <p className="text-gray-300">{swag.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="py-16 md:py-20 relative">
          <div className="container mx-auto px-4 max-w-full">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 md:mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 font-sans">
                Event <span className="text-purple-400">Timeline</span>
              </h2>
            </motion.div>

            <div className="max-w-4xl mx-auto px-4">
              {timeline.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`flex ${
                    index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  } items-center gap-8 mb-12`}
                >
                  <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center">
                        <event.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {event.phase}
                        </h3>
                        <p className="text-cyan-400 font-semibold">
                          {event.date}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-300">{event.description}</p>
                  </div>

                  <div className="w-4 h-4 rounded-full bg-cyan-400 relative">
                    <div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping" />
                  </div>

                  <div className="flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
            {/* Sponsors Section */}
            <Sponsor />

        {/* Final CTA */}
        <div className="py-16 md:py-20 relative">
          <div className="container mx-auto px-4 text-center max-w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl md:rounded-3xl p-6 md:p-12 max-w-4xl mx-auto border border-white/20"
            >
              <h2 className="text-3xl md:text-6xl font-bold mb-6 font-sans">
                Ready to <span className="text-cyan-400">Hack</span>?
              </h2>
              <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto">
                Join hundreds of developers, designers, and innovators in the
                most exciting hackathon of the year. Your next big idea starts
                here.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 md:px-8 py-3 text-base md:text-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                  onClick={handleRegister} // Add this
                >
                  <Zap className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Register Now
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleViewGuidelines}
                  className="bg-transparent border-cyan-400/50 text-cyan-400 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold hover:bg-cyan-400/10"
                >
                  View Guidelines
                </Button>
              </div>

              <p className="text-xs md:text-sm text-gray-400 mt-4 md:mt-6">
                Limited spots available. Registration closes 16 Jan 26 (11:59 PM).
              </p>
            </motion.div>
          </div>
        </div>
        <GuidelinesModal
          isOpen={showGuidelines}
          onClose={() => setShowGuidelines(false)}
        />
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import {
  Clock,
  Users,
  Target,
  Trophy,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Zap,
  Shield,
  Vote,
  Timer,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import video from "../../assets/video/Karam_Sanket_ENTRO.mp4";
const KaramSanketPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    v.muted = true; // autoplay works only when muted
    v.loop = true;
    v.playsInline = true;
    v.play().catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-transparent font-exo relative overflow-hidden mb-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 max-w-l mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center w-full mb-12 -mt-52">
              {/* <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-lg opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-r from-cyan-500 to-purple-500 p-1 rounded-full">
                  <div className="bg-gray-900 p-4 rounded-full">
                    <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin-slow" />
                  </div>
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold font-orbitron bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                KARAM SANKET
              </h1> */}
              <video
                ref={videoRef}
                className=""
                autoPlay
                // muted
                loop
                playsInline
              >
                {/* <source src="/video.mp4" type="video/mp4" />
                <source src="/video.webm" type="video/webm" /> */}
                <source src={video} type="video/mp4" />
              </video>
            </div>

            <div className="glass-card p-6 max-w-3xl mx-auto border-2 border-cyan-500/30">
              <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                Team Reshuffle Challenge
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                An exciting strategic twist designed to test teamwork,
                decision-making, and adaptability. During this challenge, every
                team must eliminate one member from their own team — but not
                permanently.
              </p>
            </div>

            {/* Quote Section */}
            <div className="glass-card p-6 max-w-3xl mx-auto mt-8 border-2 border-pink-500/30">
              <div className="flex items-start gap-4">
                <Sparkles className="w-8 h-8 text-yellow-400 flex-shrink-0 animate-pulse" />
                <div>
                  <p className="text-xl italic text-gray-300">
                    "Remember, eliminating a teammate might feel like strategy…
                    <span className="block mt-2 text-pink-400 font-bold">
                      Kick someone out if you want… but KARMA might make them
                      smarter, stronger, and suddenly your competitor.
                    </span>
                    <span className="block mt-2 text-cyan-400">
                      Good luck facing your own creation! 😭💀🔥"
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {["overview", "workflow", "scoring", "rules", "goals", "faq"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-orbitron font-bold transition-all ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-lg shadow-cyan-500/25"
                    : "glass hover:bg-white/10 text-gray-400 hover:text-white"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            )
          )}
        </div>

        {/* Main Content */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* How it Works */}
            {activeTab === "overview" && (
              <>
                <div className="glass-card p-8">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Zap className="w-7 h-7 text-cyan-400" />
                    How the Challenge Works
                  </h3>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-gray-900/50 to-gray-900/20 p-6 rounded-xl border border-cyan-500/20">
                      <h4 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Mandatory Elimination
                      </h4>
                      <ul className="space-y-3 text-gray-300">
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0" />
                          Every team must vote to eliminate exactly one member
                          from their team
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0" />
                          The eliminated participant will automatically be
                          assigned to another team
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0" />
                          Your team will simultaneously receive a new member
                          from the reshuffle
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gradient-to-r from-gray-900/50 to-gray-900/20 p-6 rounded-xl border border-purple-500/20">
                      <h4 className="text-xl font-bold text-purple-400 mb-3 flex items-center gap-2">
                        <Timer className="w-5 h-5" />
                        When Does It Happen?
                      </h4>
                      <ul className="space-y-3 text-gray-300">
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                          Elimination voting opens 2 hours after the event
                          begins
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                          Reshuffled teams become active exactly 3 hours after
                          the event begins
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Pro Strategy Tip - Moved here */}
                <div className="glass-card p-3 border-2 border-yellow-500/30">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-1">
                    <Target className="w-5 h-5 text-yellow-400" />
                    Pro Strategy Tip
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Consider team balance when eliminating. Sometimes the
                    "weakest" member in your team could be the perfect fit for
                    another team's needs. Think strategically about
                    complementary skills!
                  </p>
                  <div className="mt-4 text-xs text-gray-500">
                    * Strategic elimination can make or break your final score
                  </div>
                </div>
              </>
            )}

            {/* Workflow */}
            {activeTab === "workflow" && (
              <div className="glass-card p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <RefreshCw className="w-7 h-7 text-cyan-400" />
                  Challenge Workflow
                </h3>

                <div className="space-y-6">
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-purple-500 to-pink-500" />

                    {[
                      {
                        time: "0 hours",
                        title: "Event Start",
                        icon: Zap,
                        color: "cyan",
                      },
                      {
                        time: "2 hours",
                        title: "Elimination Voting Opens",
                        icon: Vote,
                        color: "purple",
                      },
                      {
                        time: "3 hours",
                        title: "New Team Formation",
                        icon: Users,
                        color: "pink",
                      },
                      {
                        time: "After",
                        title: "Task Ends",
                        icon: CheckCircle2,
                        color: "green",
                      },
                    ].map((step, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 mb-8 relative"
                      >
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-${step.color}-500 to-${step.color}-600 flex items-center justify-center z-10`}
                        >
                          <step.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <span className="text-lg font-bold text-white">
                              {step.title}
                            </span>
                            <span className="px-3 py-1 bg-gray-800 rounded-full text-sm font-mono">
                              {step.time}
                            </span>
                          </div>
                          <p className="text-gray-400">
                            {step.description ||
                              "Critical milestone in the challenge"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Scoring */}
            {activeTab === "scoring" && (
              <div className="glass-card p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Trophy className="w-7 h-7 text-yellow-400" />
                  Scoring System
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-green-900/30 to-green-900/10 p-6 rounded-xl border border-green-500/20">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-400" />
                      <h4 className="text-xl font-bold text-green-400">
                        Successful Elimination
                      </h4>
                    </div>
                    <p className="text-gray-300">
                      Complete elimination process correctly
                    </p>
                    <div className="mt-4 text-2xl font-bold text-green-400">
                      +10 points
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-900/10 p-6 rounded-xl border border-yellow-500/20">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="w-8 h-8 text-yellow-400" />
                      <h4 className="text-xl font-bold text-yellow-400">
                        Tie Situations
                      </h4>
                    </div>
                    <p className="text-gray-300">
                      Same votes? System decides based on fairness rules
                    </p>
                    <div className="mt-4 text-2xl font-bold text-yellow-400">
                      +10 points
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-900/30 to-red-900/10 p-6 rounded-xl border border-red-500/20">
                    <div className="flex items-center gap-3 mb-4">
                      <XCircle className="w-8 h-8 text-red-400" />
                      <h4 className="text-xl font-bold text-red-400">
                        Failure to Eliminate
                      </h4>
                    </div>
                    <p className="text-gray-300">
                      Don't eliminate by deadline? System randomly chooses
                    </p>
                    <div className="mt-4 text-2xl font-bold text-red-400">
                      –10 points
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rules */}
            {activeTab === "rules" && (
              <div className="glass-card p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Shield className="w-7 h-7 text-cyan-400" />
                  Additional Rules & Guidelines
                </h3>

                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-gray-900/50 to-gray-900/20 p-6 rounded-xl border border-cyan-500/20">
                    <h4 className="text-lg font-bold text-cyan-400 mb-3">
                      Team Formation After Reshuffle
                    </h4>
                    <p className="text-gray-300">
                      New teams will be finalized 3 hours after the hackathon
                      begins. After this reshuffle, no further eliminations will
                      occur.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-gray-900/50 to-gray-900/20 p-6 rounded-xl border border-purple-500/20">
                    <h4 className="text-lg font-bold text-purple-400 mb-3">
                      Fair Play & Integrity
                    </h4>
                    <p className="text-gray-300 mb-3">
                      Teams are encouraged to make decisions based on:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        "Contribution",
                        "Participation",
                        "Technical Skills",
                        "Team Harmony",
                      ].map((item) => (
                        <div
                          key={item}
                          className="bg-gray-900/50 px-4 py-2 rounded-lg text-center"
                        >
                          <span className="text-sm text-gray-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-900/50 to-gray-900/20 p-6 rounded-xl border border-pink-500/20">
                    <h4 className="text-lg font-bold text-pink-400 mb-3">
                      System Decision Criteria (if tie or no elimination)
                    </h4>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-pink-500 rounded-full" />
                        Random selection
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-pink-500 rounded-full" />
                        Contribution score
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-pink-500 rounded-full" />
                        Activity score
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-pink-500 rounded-full" />
                        Previous voting pattern
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Goals */}
            {activeTab === "goals" && (
              <div className="glass-card p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Target className="w-7 h-7 text-yellow-400" />
                  Event Goals
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      title: "Teamwork Under Pressure",
                      description:
                        "Learn to make strategic decisions as a team when stakes are high",
                      icon: Users,
                      color: "cyan",
                    },
                    {
                      title: "Improve Adaptability",
                      description:
                        "Quickly adjust to new team dynamics and different working styles",
                      icon: RefreshCw,
                      color: "purple",
                    },
                    {
                      title: "Fair Decision Making",
                      description:
                        "Practice objective assessment and democratic voting processes",
                      icon: Shield,
                      color: "pink",
                    },
                  ].map((goal, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-gray-900/30 to-gray-900/10 p-6 rounded-xl border border-gray-700 hover:border-cyan-500/30 transition-all"
                    >
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-r from-${goal.color}-500 to-${goal.color}-600 flex items-center justify-center mb-4`}
                      >
                        <goal.icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2">
                        {goal.title}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {goal.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Example Scenario */}
                <div className="mt-8 bg-gradient-to-r from-purple-900/20 to-cyan-900/20 p-6 rounded-xl border border-purple-500/30">
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    Example Scenario
                  </h4>
                  <p className="text-gray-300 leading-relaxed">
                    If{" "}
                    <span className="text-cyan-400 font-bold">
                      Team Phoenix
                    </span>{" "}
                    has a tie between
                    <span className="text-pink-400 font-bold">
                      {" "}
                      Member A
                    </span>{" "}
                    and
                    <span className="text-pink-400 font-bold"> Member B</span>,
                    the system automatically eliminates one of them and
                    reshuffles them into another team.
                    <span className="block mt-2 text-green-400">
                      Team Phoenix gets +10 points and receives a new member in
                      return.
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* FAQ */}
            {activeTab === "faq" && (
              <div className="glass-card p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <HelpCircle className="w-7 h-7 text-cyan-400" />
                  Frequently Asked Questions
                </h3>

                <div className="space-y-6">
                  {[
                    {
                      q: "Can we eliminate someone who is already reshuffled?",
                      a: "No, once a member has been reshuffled into a new team, they cannot be eliminated again in the same challenge.",
                    },
                    {
                      q: "Is elimination anonymous?",
                      a: "Yes, all elimination votes are completely anonymous to maintain fairness and prevent bias.",
                    },
                    {
                      q: "Can the eliminated member return to the original team?",
                      a: "No, once reshuffled, the member remains with their new team for the remainder of the event.",
                    },
                    {
                      q: "What if our team has only 2 members?",
                      a: "The system will automatically handle edge cases with special rules - check with event organizers for specific scenarios.",
                    },
                    {
                      q: "Can teams communicate about who to eliminate?",
                      a: "Yes, strategic discussion is encouraged, but voting remains private and individual.",
                    },
                  ].map((faq, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-gray-900/30 to-gray-900/10 p-6 rounded-xl border border-gray-700"
                    >
                      <h4 className="text-lg font-bold text-cyan-400 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                        {faq.q}
                      </h4>
                      <p className="text-gray-300 ml-4">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Info Cards */}
          <div className="space-y-8">
            {/* Event Timeline Card */}
            {/* <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                Event Timeline
              </h3>
              <div className="space-y-4">
                {[
                  { time: "00:00", label: "Event Start", status: "current" },
                  { time: "02:00", label: "Voting Opens", status: "upcoming" },
                  {
                    time: "03:00",
                    label: "Reshuffle Active",
                    status: "upcoming",
                  },
                  { time: "End", label: "Final Teams", status: "upcoming" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        item.status === "current"
                          ? "bg-cyan-500 animate-pulse"
                          : item.status === "upcoming"
                          ? "bg-gray-600"
                          : "bg-gray-800"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">{item.label}</span>
                        <span className="font-mono text-sm bg-gray-800 px-2 py-1 rounded">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}

            {/* Key Features Card */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Key Features
              </h3>
              <div className="space-y-4">
                {[
                  "Strategic Team Building",
                  "Adaptability Testing",
                  "Fair Play Emphasis",
                  "Real-time Voting",
                  "Automated Reshuffling",
                  "Karma-based Scoring",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-cyan-400">+10</div>
                  <div className="text-sm text-gray-400">Successful Points</div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-400">-10</div>
                  <div className="text-sm text-gray-400">Penalty Points</div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-400">1</div>
                  <div className="text-sm text-gray-400">Member Eliminated</div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-400">1</div>
                  <div className="text-sm text-gray-400">Member Received</div>
                </div>
              </div>
            </div>

            {/* Strategy Tip Card - REMOVED FROM HERE */}
          </div>
        </main>
      </div>
    </div>
  );
};
export default KaramSanketPage;
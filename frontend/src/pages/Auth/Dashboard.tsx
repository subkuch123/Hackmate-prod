import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { BackgroundScene } from "@/components/3d/background-scene";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Zap,
  Target,
  Trophy,
  Calendar,
  Clock,
  Star,
  Award,
  Plus,
  Rocket,
  Lightbulb,
  Code,
  HeartHandshake,
  BookOpen,
  Compass,
  MapPin,
  Globe,
} from "lucide-react";
import { useAppSelector, useUser } from "@/hooks/authHook";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/config/API_URL";
import axios from "axios";

// Default user data structure
const defaultUser = {
  name: "User",
  profilePicture: "",
  currentHackathonId: null,
  profileCompletion: 0,
  skills: [],
};

// Default hackathon data structure
const defaultHackathonData = {
  _id: "default",
  title: "AI Revolution Hackathon",
  description:
    "Build the next generation of AI applications and solve real-world challenges",
  startDate: "2025-03-15T00:00:00.000Z",
  endDate: "2025-03-17T00:00:00.000Z",
  status: "registration_open",
  totalMembersJoined: 247,
  maxTeamSize: 5,
  maxRegistrations: 500,
  prizes: [
    { position: "1st", amount: 10000, _id: "1" },
    { position: "2nd", amount: 5000, _id: "2" },
    { position: "3rd", amount: 2500, _id: "3" },
  ],
  registrationDeadline: "2024-03-10T00:00:00.000Z",
  venue: "Virtual",
  mode: "online",
  tags: ["AI", "Machine Learning", "Innovation"],
  problemStatements: [
    "Build intelligent solutions for real-world problems",
    "Create innovative AI applications",
  ],
  registrationFee: 0,
  organizer: {
    name: "Hackforce Team",
    contactEmail: "contact@example.com",
    contactNumber: "+0000000000",
    organization: "Innovation Hub",
  },
  socialLinks: {
    website: "#",
    linkedin: "#",
    twitter: "#",
    discord: "#",
  },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user: userData } = useUser();
  const { hackathon: reduxHackathon } = useAppSelector(
    (state) => state.userHack
  );
  const { teamId } = useAppSelector((state) => state.id);

  const [hackathon, setHackathon] = useState<any>(null);

  // Use user data from backend or default values
  const user = userData || defaultUser;

  // Generate logo from name
  let logoName = "U";
  if (user.name && user.name !== "User") {
    const letters: string[] = user.name.split(" ");
    if (letters.length >= 2) {
      logoName = (letters[0][0] + letters[1][0]).toUpperCase();
    } else if (letters[0].length > 0) {
      logoName = letters[0][0].toUpperCase();
    }
  }

  // Fetch hackathon data silently
  const fetchHackathonData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/hackathons/786`);
      if (response.data.success) {
        setHackathon(response.data.data ? response.data.data : []);
      }
    } catch (err) {
      console.error("Fetch hackathon error:", err);
      // No error state, just use default data
    }
  };

  useEffect(() => {
    fetchHackathonData();
  }, []);

  // Use actual hackathon data or fallback to Redux/user data or default
  const currentHackathon = reduxHackathon || null;

  // User stats with fallback values
  const userStats = {
    name: user.name || "User",
    avatar: user.profilePicture || "/placeholder-avatar.jpg",
    level: Math.floor((user.profileCompletion || 0) / 10) + 1 || 1,
    xp: (user.profileCompletion || 0) * 100 || 0,
    nextLevelXp: 1000,
    hackathonsJoined: user.currentHackathonId ? 1 : 0,
    teamsFormed: teamId ? 1 : 0,
    projectsCompleted: 0,
    rank: user.profileCompletion > 50 ? "Skilled Hacker" : "Rookie Hacker",
  };

  // Use actual user skills or default ones
  const skills =
    user.skills && user.skills.length > 0
      ? user.skills.map((skill) => ({
          name: skill,
          level: Math.floor(Math.random() * 30) + 70,
          color: "neon-cyan",
        }))
      : [
          { name: "JavaScript", level: 85, color: "neon-cyan" },
          { name: "HTML/CSS", level: 78, color: "neon-lime" },
          { name: "React", level: 92, color: "neon-purple" },
        ];

  // Active lobbies using hackathon data
  const activeLobbies = [
    {
      id: hackathon?._id || null,
      title: hackathon?.title,
      participants: hackathon?.totalMembersJoined,
      maxParticipants: hackathon?.maxRegistrations,
      timeLeft: calculateTimeLeft(hackathon?.registrationDeadline),
      difficulty: "Medium",
      prize:
        hackathon?.prizes && hackathon?.prizes.length > 0
          ? `₹${hackathon?.prizes[0].amount.toLocaleString()} Prize`
          : "TBA",
      tags: hackathon?.tags || ["AI", "Machine Learning", "Innovation"],
    },
  ];

  const recentAchievements = [
    {
      title: "New Challenger",
      description: "Joined your first hackathon!",
      icon: Rocket,
    },
    {
      title: "Team Player",
      description: "Collaborated with a team on a project",
      icon: Users,
    },
    {
      title: "Quick Starter",
      description: "Submitted your first idea or project",
      icon: Lightbulb,
    },
    {
      title: "Speed Demon",
      description: "Completed a challenge in under 2 hours",
      icon: Zap,
    },
    {
      title: "Innovation Master",
      description: "Won 3 hackathons this month",
      icon: Trophy,
    },
    {
      title: "Veteran Hacker",
      description: "Participated in 5 or more hackathons",
      icon: Award,
    },
    {
      title: "Creative Coder",
      description: "Used an unconventional tech stack in your project",
      icon: Code,
    },
    {
      title: "Community Hero",
      description: "Helped another team or participant",
      icon: HeartHandshake,
    },
    {
      title: "Persistent Learner",
      description: "Improved your project after feedback",
      icon: BookOpen,
    },
    {
      title: "Explorer",
      description: "Joined hackathons in multiple categories",
      icon: Compass,
    },
  ];

  useEffect(() => {
    if (!userData) {
      navigate("/login");
    }
  }, [userData, navigate]);

  // Helper function to calculate time left
  function calculateTimeLeft(deadline: string): string {
    const now = new Date().getTime();
    const deadlineTime = new Date(deadline).getTime();
    const timeLeft = deadlineTime - now;

    if (timeLeft <= 0) return "Registration Closed";

    const hours = Math.floor(
      (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "TBA";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="min-h-screen animated-bg relative overflow-hidden pt-24">
      <BackgroundScene className="absolute inset-0 w-full h-full" />

      <div className="relative max-w-7xl mx-auto p-6 space-y-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <GlassCard variant="glow" className="p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              {/* Left Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full">
                {/* Avatar + Level */}
                <div className="relative mx-auto sm:mx-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-primary rounded-full flex items-center justify-center text-xl sm:text-2xl font-orbitron font-bold">
                    {logoName}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-neon-cyan rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-background">
                    {userStats.level}
                  </div>
                </div>

                {/* User Info */}
                <div className="text-center sm:text-left">
                  <h1 className="font-orbitron font-bold text-2xl sm:text-3xl text-foreground mb-1 sm:mb-2">
                    Welcome back, {user.name.toUpperCase()}!
                  </h1>
                  <p className="text-muted-foreground text-sm sm:text-base mb-3">
                    {userStats.rank} • Level {userStats.level}
                  </p>
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3">
                    <Badge
                      variant="secondary"
                      className="bg-primary/20 text-primary border-primary/30 text-xs sm:text-sm"
                    >
                      <Star className="w-3 h-3 mr-1" />
                      {userStats.xp.toLocaleString()} XP
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-neon-lime/30 text-neon-lime text-xs sm:text-sm"
                    >
                      <Trophy className="w-3 h-3 mr-1" />
                      {user.profileCompletion || 0}% Profile Complete
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Button Section */}
              <div className="w-full lg:w-auto flex justify-center lg:justify-end">
                <Button
                  variant="hero"
                  size="lg"
                  className="group flex items-center justify-center w-full sm:w-auto px-4 py-2 text-sm md:text-base md:px-6"
                  onClick={() =>
                    navigate("/hackathon/786")
                  }
                >
                  <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                  Join New Hackathon
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Current Hackathon Section */}

        {currentHackathon && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <GlassCard className="p-6 mb-8 border-neon-cyan/30">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-orbitron font-bold text-2xl text-neon-cyan">
                    Current Hackathon
                  </h2>
                  <Badge
                    variant="outline"
                    className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30"
                  >
                    {formatStatus(currentHackathon.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <h3 className="font-orbitron font-semibold text-xl text-foreground mb-2">
                      {currentHackathon.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {currentHackathon.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Starts
                        </p>
                        <p className="font-medium">
                          {formatDate(currentHackathon.startDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Ends
                        </p>
                        <p className="font-medium">
                          {formatDate(currentHackathon.endDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Venue
                        </p>
                        <p className="font-medium">{currentHackathon.venue}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Mode
                        </p>
                        <p className="font-medium capitalize">
                          {currentHackathon.mode}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm mb-4">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {currentHackathon.totalMembersJoined} Participants
                      </span>
                      <span>•</span>
                      <span>Team Size: {currentHackathon.maxTeamSize}</span>
                      {currentHackathon.registrationFee > 0 && (
                        <>
                          <span>•</span>
                          <span>Fee: ₹{currentHackathon.registrationFee}</span>
                        </>
                      )}
                    </div>

                    {/* Problem Statements */}
                    {currentHackathon.problemStatements &&
                      currentHackathon.problemStatements.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-orbitron font-semibold text-foreground mb-2">
                            Problem Statements
                          </h4>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {currentHackathon.problemStatements
                              .slice(0, 2)
                              .map((statement: string, index: number) => (
                                <li key={index}>{statement}</li>
                              ))}
                            {currentHackathon.problemStatements.length > 2 && (
                              <li className="text-neon-cyan">
                                +{currentHackathon.problemStatements.length - 2}{" "}
                                more
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                    {/* Tags */}
                    {currentHackathon.tags &&
                      currentHackathon.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {currentHackathon.tags.map(
                            (tag: string, index: number) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            )
                          )}
                        </div>
                      )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-orbitron font-semibold text-foreground mb-3">
                        Prizes
                      </h4>
                      {currentHackathon.prizes &&
                      currentHackathon.prizes.length > 0 ? (
                        <div className="space-y-2">
                          {currentHackathon.prizes
                            .slice(0, 3)
                            .map((prize: any) => (
                              <div
                                key={prize._id}
                                className="flex justify-between items-center p-3 rounded-lg bg-accent/10 border border-accent/20"
                              >
                                <span className="font-medium">
                                  {prize.position}
                                </span>
                                <span className="text-neon-cyan font-semibold">
                                  ₹{prize.amount.toLocaleString()}
                                </span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">
                          Prize details coming soon
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Button
                        variant="neon"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          navigate(`/hackathon/${currentHackathon._id}`)
                        }
                      >
                        View Hackathon Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => navigate("/team")}
                      >
                        Team Dashboard
                      </Button>
                    </div>

                    {/* Organizer Info */}
                    {currentHackathon.organizer && (
                      <div className="pt-4 border-t border-glass-border">
                        <p className="text-sm text-muted-foreground">
                          Organized by
                        </p>
                        <p className="font-medium text-foreground">
                          {currentHackathon.organizer.organization}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <GlassCard className="p-6 text-center">
                  <Users className="w-8 h-8 text-neon-cyan mx-auto mb-3" />
                  <div className="text-2xl font-orbitron font-bold text-foreground mb-1">
                    {userStats.hackathonsJoined}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Hackathons Joined
                  </div>
                </GlassCard>
                <GlassCard className="p-6 text-center">
                  <Target className="w-8 h-8 text-neon-lime mx-auto mb-3" />
                  <div className="text-2xl font-orbitron font-bold text-foreground mb-1">
                    {userStats.teamsFormed}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Teams Formed
                  </div>
                </GlassCard>
                <GlassCard className="p-6 text-center">
                  <Trophy className="w-8 h-8 text-neon-magenta mx-auto mb-3" />
                  <div className="text-2xl font-orbitron font-bold text-foreground mb-1">
                    {userStats.projectsCompleted}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Projects Completed
                  </div>
                </GlassCard>
              </div>
            </motion.div>

            {/* Active Lobbies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6">
                <h2 className="font-orbitron font-bold text-xl sm:text-2xl text-foreground text-center sm:text-left w-full sm:w-auto">
                  Active Lobbies
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="self-center sm:self-auto"
                  onClick={() => navigate("/lobbies")}
                >
                  View All
                </Button>
              </div>

              {/* Lobbies List */}
              <div className="space-y-4">
                {hackathon && (
                  <>
                    {activeLobbies.map((lobby, index) => (
                      <motion.div
                        key={lobby.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <GlassCard
                          variant="interactive"
                          className="p-4 sm:p-6 flex flex-col gap-4"
                        >
                          {/* Top Row */}
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-8">
                            {/* Left Info */}
                            <div className="w-full">
                              <h3 className="font-orbitron font-semibold text-lg sm:text-xl text-foreground mb-1">
                                {lobby.title}
                              </h3>

                              {/* Stats */}
                              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                                <span className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {lobby.participants}/{lobby.maxParticipants}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {lobby.timeLeft}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="border-success/30 text-success text-xs sm:text-sm"
                                >
                                  {lobby.difficulty}
                                </Badge>
                              </div>

                              {/* Tags */}
                              <div className="flex flex-wrap gap-2">
                                {lobby.tags.map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="text-xs sm:text-sm"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Right Info (Prize + Button) */}
                            <div className="flex flex-col items-end w-full md:w-auto text-right gap-2">
                              <div className="font-orbitron font-bold text-neon-cyan text-base sm:text-lg">
                                {lobby.prize}
                              </div>
                              <Button
                                onClick={() =>
                                  navigate(`/hackathon/${lobby.id}`)
                                }
                                variant="neon"
                                size="sm"
                                className="w-full sm:w-auto"
                              >
                                Join Lobby
                              </Button>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${
                                  (lobby.participants / lobby.maxParticipants) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Skills Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <GlassCard className="p-6">
                <h3 className="font-orbitron font-bold text-xl text-foreground mb-6">
                  Skill Levels
                </h3>
                <div className="space-y-4">
                  {skills.map((skill, index) => (
                    <div key={skill.name}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-foreground font-medium">
                          {skill.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {skill.level}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.level}%` }}
                          transition={{
                            delay: 0.5 + index * 0.1,
                            duration: 0.8,
                          }}
                          className={`bg-neon-cyan h-2 rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Recent Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <GlassCard className="p-6">
                <h3 className="font-orbitron font-bold text-xl text-foreground mb-6">
                  Recent Achievements
                </h3>
                <div className="space-y-4">
                  {recentAchievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.title}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20"
                    >
                      <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                        <achievement.icon className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground text-sm">
                          {achievement.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {achievement.description}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

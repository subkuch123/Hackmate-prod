// app/teams/page.jsx
"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { BackgroundScene } from "@/components/3d/background-scene";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  MessageCircle,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  MoreVertical,
  Github,
  ExternalLink,
  Trophy,
  Plus,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { API_URL } from "@/config/API_URL";
import { useUser } from "@/hooks/authHook";
import { Link } from "react-router-dom";

// Helper functions
const getStatusColor = (status) => {
  switch (status) {
    case "online":
      return "bg-success";
    case "away":
      return "bg-warning";
    case "offline":
      return "bg-muted";
    default:
      return "bg-muted";
  }
};

const getTaskStatusIcon = (status) => {
  switch (status) {
    case "Completed":
      return <CheckCircle className="w-4 h-4 text-success" />;
    case "In Progress":
      return <Circle className="w-4 h-4 text-neon-cyan fill-current" />;
    case "Pending":
      return <Circle className="w-4 h-4 text-muted-foreground" />;
    case "Blocked":
      return <AlertCircle className="w-4 h-4 text-destructive" />;
    default:
      return <Circle className="w-4 h-4 text-muted-foreground" />;
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case "High":
      return "border-l-destructive";
    case "Critical":
      return "border-l-destructive border-l-4";
    case "Medium":
      return "border-l-warning";
    case "Low":
      return "border-l-success";
    default:
      return "border-l-muted";
  }
};

const calculateTimeRemaining = (endDate) => {
  if (!endDate) return "Not specified";

  const now = new Date();
  const end = new Date(endDate);
  const diff = end - now;

  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h ${minutes}m`;
};

const calculateProgress = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;
  return Math.round((completedTasks / tasks.length) * 100);
};

const getMemberStatus = (lastActivity) => {
  if (!lastActivity) return "offline";

  const lastActive = new Date(lastActivity);
  const now = new Date();
  const diffMinutes = (now - lastActive) / (1000 * 60);

  if (diffMinutes < 5) return "online";
  if (diffMinutes < 30) return "away";
  return "offline";
};

// API URL - adjust based on your environment
export default function TeamsStatusPage() {
  const [teamsData, setTeamsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTeam, setActiveTeam] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUser();
  // Fetch all teams data
  const fetchTeamsData = async () => {
    try {
      setLoading(true);
      // Get user ID from localStorage or auth context
      console.log("Fetching teams data...", user);
      const userId = user?._id || localStorage.getItem("userId");
      const hackathonId = localStorage.getItem("hackathonId");
      const teamId = localStorage.getItem("teamId");
      const teamMemberId = localStorage.getItem("teamMemberId");
      const token = localStorage.getItem("token");
      console.log("Using User ID:", userId);
      if (!userId) {
        setError("User ID not jtjfound. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/page/unified-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userId,
          hackathonId: hackathonId,
          teamId: teamId,
          teamMemberId: teamMemberId,
          userSend: true,
          teamSend: true,
          teamMembersSend: true,
          tasksSend: true,
          hackathonSend: true,
          participantsSend: false,
          discussionsSend: false,
          problemStatementsSend: false,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log(result);
        setTeamsData(result.data);

        setError(null);

        // Set active team (first active team or first team in list)
        if (
          result.data.userTeamsSummary &&
          result.data.userTeamsSummary.length > 0
        ) {
          setActiveTeam(result.data.userTeamsSummary[0]);
          setError(null);
        } else if (result.data.team) {
          // If no userTeamsSummary but team data exists, create a summary
          setActiveTeam({
            teamId: result.data.team._id,
            teamName: result.data.team.name,
            role: "Member",
            hackathon: result.data.hackathon,
          });
          setError(null);
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to fetch teams data");
      console.error("Error fetching teams:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setError(null);
    }
  };

  useEffect(() => {
    fetchTeamsData();
  }, []);

  const refreshData = () => {
    setRefreshing(true);
    fetchTeamsData();
  };

  // Get current team data based on active team selection
  const getCurrentTeamData = () => {
    if (!teamsData) return null;

    // If we have an active team from userTeamsSummary, use that
    if (activeTeam && teamsData.teamMembers) {
      const teamDetails = teamsData.team || {};
      const teamMembers = teamsData.teamMembers || [];
      const tasks = teamsData.tasks || [];
      const hackathon = teamsData.hackathon || activeTeam.hackathon || {};

      // Filter team members for the active team
      const filteredMembers = teamMembers.filter(
        (member) => member.teamId?._id === activeTeam.teamId
      );

      // Filter tasks for the active team
      const filteredTasks = tasks.filter(
        (task) => task.teamId?._id === activeTeam.teamId
      );

      // Transform members data
      const members = filteredMembers.map((member) => ({
        id: member._id,
        name: member.userId?.name || "Unknown User",
        role: member.role || "Member",
        avatar: member.userId?.profilePicture || "/placeholder-avatar.jpg",
        skills: member.userId?.skills || member.skills || [],
        status: getMemberStatus(member.joinedAt),
        isCurrentUser: member.userId?._id === teamsData.user?._id,
        lastActivity: member.joinedAt,
      }));

      // Transform tasks data
      const transformedTasks = filteredTasks.map((task) => ({
        id: task._id,
        title: task.title,
        description: task.description,
        assignee: task.assignedTo?.name || "Unassigned",
        status: task.status,
        priority: task.priority,
        assignedToId: task.assignedTo?._id,
      }));

      return {
        id: activeTeam.teamId,
        name: activeTeam.teamName || teamDetails.name,
        hackathon: hackathon.hackName || hackathon.title || "Unknown Hackathon",
        status: "Active",
        timeRemaining: calculateTimeRemaining(hackathon.endDate),
        progress: calculateProgress(filteredTasks),
        members,
        tasks: transformedTasks,
        hackathonData: hackathon,
        teamData: teamDetails,
      };
    }

    // Fallback: if no active team but we have team data
    if (teamsData.team) {
      const teamDetails = teamsData.team;
      const teamMembers = teamsData.teamMembers || [];
      const tasks = teamsData.tasks || [];
      const hackathon = teamsData.hackathon || {};

      // Transform members data
      const members = teamMembers.map((member) => ({
        id: member._id,
        name: member.userId?.name || "Unknown User",
        role: member.role || "Member",
        avatar: member.userId?.profilePicture || "/placeholder-avatar.jpg",
        skills: member.userId?.skills || member.skills || [],
        status: getMemberStatus(member.joinedAt),
        isCurrentUser: member.userId?._id === teamsData.user?._id,
        lastActivity: member.joinedAt,
      }));

      // Transform tasks data
      const transformedTasks = tasks.map((task) => ({
        id: task._id,
        title: task.title,
        description: task.description,
        assignee: task.assignedTo?.name || "Unassigned",
        status: task.status,
        priority: task.priority,
        assignedToId: task.assignedTo?._id,
      }));

      return {
        id: teamDetails._id,
        name: teamDetails.name,
        hackathon: hackathon.hackName || hackathon.title || "Unknown Hackathon",
        status: "Active",
        timeRemaining: calculateTimeRemaining(hackathon.endDate),
        progress: calculateProgress(tasks),
        members,
        tasks: transformedTasks,
        hackathonData: hackathon,
        teamData: teamDetails,
      };
    }

    return null;
  };

  const currentTeam = getCurrentTeamData();

  if (loading) {
    return (
      <div className="min-h-screen animated-bg relative overflow-hidden pt-24">
        <BackgroundScene className="absolute inset-0 w-full h-full" />
        <div className="relative max-w-7xl mx-auto p-6 flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-neon-cyan animate-spin mx-auto mb-4" />
            <p className="text-foreground text-lg">Loading your teams...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen animated-bg relative overflow-hidden pt-24">
        <BackgroundScene className="absolute inset-0 w-full h-full" />
        <div className="relative max-w-7xl mx-auto p-6 flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-foreground text-lg mb-4">{error}</p>
            <Button onClick={fetchTeamsData} variant="neon">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentTeam) {
    return (
      <div className="min-h-screen animated-bg relative overflow-hidden pt-24">
        <BackgroundScene className="absolute inset-0 w-full h-full" />
        <div className="relative max-w-7xl mx-auto p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="font-orbitron font-bold text-4xl md:text-5xl text-foreground mb-4">
              Your Teams
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Collaborate with talented developers and build amazing projects
              together
            </p>
          </motion.div>

          {/* No Teams State */}
          <GlassCard className="p-12 text-center">
            <Users className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="font-orbitron font-bold text-2xl text-foreground mb-4">
              No Active Teams
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You're not currently part of any active teams. Join a hackathon
              and form a team to get started!
            </p>
            <Button variant="hero" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Find a Hackathon
            </Button>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg relative overflow-hidden pt-24">
      <BackgroundScene className="absolute inset-0 w-full h-full" />

      <div className="relative max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h1 className="font-orbitron font-bold text-4xl md:text-5xl text-foreground mb-4">
                Your Teams
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Collaborate with talented developers and build amazing projects
                together
              </p>
            </div>
            <Button
              onClick={refreshData}
              variant="glass"
              size="sm"
              disabled={refreshing}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Team Selector */}
        {teamsData.userTeamsSummary &&
          teamsData.userTeamsSummary.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2 mb-6"
            >
              <span className="text-sm text-muted-foreground mr-2">
                Active Team:
              </span>
              {teamsData.userTeamsSummary.map((team) => (
                <Badge
                  key={team.teamId}
                  variant={
                    activeTeam?.teamId === team.teamId ? "default" : "outline"
                  }
                  className="cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => setActiveTeam(team)}
                >
                  {team.teamName}
                  {team.role && ` (${team.role})`}
                </Badge>
              ))}
            </motion.div>
          )}

        {/* Current Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-orbitron font-bold text-2xl text-foreground">
              Current Team
            </h2>
            <div className="flex items-center gap-2">
              <Badge
                variant="default"
                className="bg-success/20 text-success border-success/30"
              >
                {currentTeam.status}
              </Badge>
              {activeTeam?.role && (
                <Badge variant="outline" className="text-xs">
                  {activeTeam.role}
                </Badge>
              )}
            </div>
          </div>

          <GlassCard variant="glow" className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Team Overview */}
              <div className="lg:col-span-1">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-orbitron font-bold text-2xl text-foreground mb-2">
                      {currentTeam.name}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {currentTeam.hackathon}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-neon-cyan" />
                        <span className="text-foreground font-medium">
                          {currentTeam.timeRemaining}
                        </span>
                        <span className="text-muted-foreground">remaining</span>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">
                            Progress
                          </span>
                          <span className="text-foreground font-medium">
                            {currentTeam.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-500"
                            style={{ width: `${currentTeam.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link to={"/team"}>
                      <Button variant="neon" size="sm" className="flex-1">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Team Chat
                      </Button>
                    </Link>
                    <Button variant="glass" size="sm">
                      <Github className="w-4 h-4" />
                    </Button>
                    <Button variant="glass" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div className="lg:col-span-1">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-orbitron font-semibold text-lg text-foreground">
                    Team Members
                  </h4>
                  <Badge variant="outline">
                    {currentTeam.members.length} members
                  </Badge>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                  {currentTeam.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-lg glass-card"
                    >
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-gradient-primary text-foreground font-bold">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(
                            member.status
                          )}`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground text-sm">
                            {member.name}
                          </span>
                          {member.isCurrentUser && (
                            <Badge variant="secondary" className="text-xs">
                              You
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {member.role}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {member.skills.slice(0, 2).map((skill) => (
                            <Badge
                              key={skill}
                              variant="outline"
                              className="text-xs px-1"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {member.skills.length > 2 && (
                            <Badge variant="outline" className="text-xs px-1">
                              +{member.skills.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Task Board */}
              <div className="lg:col-span-1">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-orbitron font-semibold text-lg text-foreground">
                    Task Board
                  </h4>
                  <Badge variant="outline">
                    {currentTeam.tasks.length} tasks
                  </Badge>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                  {currentTeam.tasks.length > 0 ? (
                    currentTeam.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-3 rounded-lg glass border-l-2 ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        <div className="flex items-start gap-2">
                          {getTaskStatusIcon(task.status)}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground mb-1">
                              {task.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Assigned to {task.assignee}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" className="p-1">
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-4 text-muted-foreground">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No tasks yet</p>
                    </div>
                  )}
                </div>
                <Button variant="glass" size="sm" className="w-full mt-4">
                  <FileText className="w-4 h-4 mr-2" />
                  View Full Board
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

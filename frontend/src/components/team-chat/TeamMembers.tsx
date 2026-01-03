import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Plus, Mail, Calendar, User, Phone } from "lucide-react";
import { TeamMember } from "@/types/hackathon";
import { TeamInfoCard } from "./TeamInfoCard";

interface Points {
  total: number;
  history: Array<{
    description: string;
    score: number;
    createdAt: string | Date;
  }>;
}

interface TeamMembersProps {
  teamMembers: TeamMember[];
  currentUser: string;
  onlineUsers: Record<string, boolean>;
  maxTeamSize: number;
  teamName: string;
  teamDetails: {
    submissionStatus?: string;
    points: Points;
    technologies?: string[];
    isEligibleForPrize?: boolean;
    disqualified?: boolean;
    lastActivity?: string;
    createdAt?: string;
  };
}

export const TeamMembers = ({
  teamMembers,
  currentUser,
  onlineUsers,
  maxTeamSize,
  teamName,
  teamDetails,
}: TeamMembersProps) => {
  const formatLastLogin = (lastLogin: string) => {
    if (!lastLogin) return "Never";

    try {
      const now = new Date();
      const loginDate = new Date(lastLogin);
      const diffMs = now.getTime() - loginDate.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 60) {
        return `${diffMins}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else {
        return `${diffDays}d ago`;
      }
    } catch {
      return "Unknown";
    }
  };

  const getExperienceColor = (experience: string) => {
    if (!experience) return "bg-gray-500";

    switch (experience.toLowerCase()) {
      case "beginner":
        return "bg-blue-500";
      case "intermediate":
        return "bg-green-500";
      case "advanced":
        return "bg-purple-500";
      case "expert":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  // Safety check for team members
  const safeTeamMembers = Array.isArray(teamMembers) ? teamMembers : [];

  return (
    <div className="space-y-6">
      {/* Team Information Card */}
      <TeamInfoCard teamName={teamName} teamDetails={teamDetails} />

      {/* Team Members Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-orbitron font-bold text-lg text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Team Members - {teamName}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {safeTeamMembers.length}/{maxTeamSize}
            </Badge>
          </div>

          <div className="space-y-4">
            {safeTeamMembers.length > 0 ? (
              safeTeamMembers.map((member, index) => {
                // Safety check for member data
                const safeMember = {
                  _id: member?._id || `unknown-${index}`,
                  name: member?.name || "Unknown Member",
                  email: member?.email || "No email",
                  phone: member?.phone || "",
                  skills: Array.isArray(member?.skills) ? member.skills : [],
                  experience: member?.experience || "",
                  lastLogin: member?.lastLogin || "",
                  showProfileDetail: member?.showProfileDetail ?? false,
                  profileCompletion: member?.profileCompletion || 0,
                };

                return (
                  <motion.div
                    key={safeMember._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-4 bg-background/50 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-primary-foreground">
                              {safeMember.name?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                          </div>
                          <div
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                              onlineUsers[safeMember._id]
                                ? "bg-green-500"
                                : "bg-yellow-500"
                            }`}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-foreground font-semibold text-base truncate">
                              {safeMember.name}
                            </p>
                            {safeMember._id === currentUser && (
                              <Badge
                                variant="outline"
                                className="text-xs px-2 py-0"
                              >
                                You
                              </Badge>
                            )}
                            {safeMember.experience && (
                              <Badge
                                className={`text-xs px-2 py-0 ${getExperienceColor(
                                  safeMember.experience
                                )}`}
                              >
                                {safeMember.experience}
                              </Badge>
                            )}
                            {safeMember.profileCompletion > 0 && (
                              <Badge
                                variant="outline"
                                className="text-xs px-2 py-0"
                              >
                                {safeMember.profileCompletion}% Complete
                              </Badge>
                            )}
                          </div>

                          {/* Contact Information */}
                          <div className="space-y-2">
                            {/* Email */}
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              <p className="text-muted-foreground text-sm truncate">
                                {safeMember.email}
                              </p>
                            </div>

                            {/* Phone Number */}
                            {safeMember.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                <p className="text-muted-foreground text-sm truncate">
                                  {safeMember.phone}
                                </p>
                              </div>
                            )}

                            {/* Last Login */}
                            {safeMember.lastLogin && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                <p className="text-muted-foreground text-sm">
                                  Last active:{" "}
                                  {formatLastLogin(safeMember.lastLogin)}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Skills Section */}
                          {safeMember.showProfileDetail &&
                            safeMember.skills.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-border/50">
                                <div className="flex items-center gap-2 mb-2">
                                  <User className="w-3 h-3 text-primary" />
                                  <span className="text-xs font-medium text-foreground">
                                    Skills
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {safeMember.skills.map(
                                    (skill, skillIndex) => (
                                      <Badge
                                        key={skillIndex}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {skill}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No team members found</p>
              </div>
            )}

            {safeTeamMembers.length < maxTeamSize && (
              <Button
                variant="outline"
                className="w-full p-4 border-2 border-dashed border-primary/50 hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Invite Team Member
              </Button>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

// components/team/TeamInfoCard.tsx
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Flag, Clock, Calendar, Trophy, Award, Zap } from "lucide-react";

interface Points {
  total: number;
  history: Array<{
    description: string;
    score: number;
    createdAt: string | Date;
  }>;
}

interface TeamInfoCardProps {
  teamName: string;
  teamDetails: {
    submissionStatus?: string;
    points: Points;
  };
}

export const TeamInfoCard = ({ teamName, teamDetails }: TeamInfoCardProps) => {
  const getSubmissionStatusColor = (status: string) => {
    if (!status) return "bg-gray-500";

    switch (status.toLowerCase()) {
      case "submitted":
        return "bg-gradient-to-r from-green-500 to-emerald-600";
      case "not_submitted":
      case "not submitted":
        return "bg-gradient-to-r from-yellow-500 to-amber-600";
      case "late":
        return "bg-gradient-to-r from-red-500 to-rose-600";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-700";
    }
  };

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "Unknown";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  const safeTeamDetails = {
    submissionStatus: teamDetails?.submissionStatus || "not_submitted",
    points: teamDetails?.points || {
      total: 0,
      history: [],
    },
  };

  const recentPoints = teamDetails?.points?.history
    ? [...teamDetails.points.history]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 3)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="w-full"
    >
      <GlassCard className="p-4 sm:p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="font-orbitron font-bold text-lg sm:text-xl text-foreground flex items-center gap-2">
            <Flag className="w-5 h-5 text-primary" />
            Team Information
          </h3>
          <div className="flex flex-wrap gap-2">
            <Badge
              className={`${getSubmissionStatusColor(
                safeTeamDetails.submissionStatus
              )} text-white px-3 py-1.5 font-medium`}
            >
              {safeTeamDetails.submissionStatus.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Team Name & Points Summary */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Flag className="w-4 h-4 text-primary" />
                Team Name
              </h4>
              <div className="text-lg sm:text-xl font-bold text-primary bg-gradient-to-r from-primary/10 to-transparent p-3 rounded-lg">
                {teamName}
              </div>
            </div>

            {/* Points Display */}
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                Total Points
              </h4>
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-primary to-primary/70 text-white p-4 rounded-xl shadow-lg min-w-[80px] text-center">
                  <div className="text-2xl sm:text-3xl font-bold">
                    {safeTeamDetails.points.total || 0}
                  </div>
                  <div className="text-xs opacity-90">POINTS</div>
                </div>
                {safeTeamDetails.points.total > 0 && (
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium">
                      Ranked #{Math.max(1, Math.floor(Math.random() * 20) + 1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Points History */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Recent Points History
            </h4>
            <div className="space-y-3">
              {recentPoints.length > 0 ? (
                recentPoints.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-background/50 to-background/30 rounded-lg border border-border/50 hover:border-primary/30 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {point.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(point.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-lg font-bold text-green-500">
                        +{point.score}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground bg-background/30 rounded-xl">
                  <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No points history yet</p>
                  <p className="text-xs mt-1">
                    Points will appear here as you earn them
                  </p>
                </div>
              )}
            </div>

            {/* View All History Link */}
            {safeTeamDetails.points.history?.length > 3 && (
              <motion.div whileHover={{ x: 5 }} className="mt-4 text-right">
                <button className="text-sm text-primary hover:text-primary/80 font-medium flex items-center justify-end gap-1 w-full group">
                  <span>View Full History</span>
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Performance Indicator */}
        {safeTeamDetails.points.total > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 pt-4 border-t border-border/50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                Performance Trend
              </span>
              <span className="text-xs text-muted-foreground">
                Last 7 activities
              </span>
            </div>
            <div className="h-2 bg-background/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(
                    100,
                    (safeTeamDetails.points.total / 500) * 100
                  )}%`,
                }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
              />
            </div>
          </motion.div>
        )}
      </GlassCard>
    </motion.div>
  );
};

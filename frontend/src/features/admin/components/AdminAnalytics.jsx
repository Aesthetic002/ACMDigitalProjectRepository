import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useScrollAnimation, useCountUp } from "@/hooks/useScrollAnimation";
import {
  TrendingUp,
  Users,
  FolderGit2,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  XCircle,
} from "lucide-react";
import { adminAPI, projectsAPI } from "@/services/api";
import { toast } from "sonner";
import { format } from "date-fns";

// ── Stat Card ───────────────────────────────────────────────
function StatCard({ icon, label, value, trend, delay }) {
  const { count, ref } = useCountUp(value, 2000);
  const { ref: animRef, isInView } = useScrollAnimation({ threshold: 0.3 });

  return (
    <motion.div
      ref={animRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <div className="text-primary">{icon}</div>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-green-500">
          <TrendingUp className="h-3 w-3" />
          {trend}
        </span>
      </div>
      <div ref={ref}>
        <p className="text-2xl font-bold text-foreground">{count}</p>
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );
}

// ── Main Component ───────────────────────────────────────────
export function AdminAnalytics() {
  const { ref: sectionRef, isInView } = useScrollAnimation({ threshold: 0.1 });
  const queryClient = useQueryClient();

  // Analytics summary
  const { data: analyticsData } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => adminAPI.getAnalytics(),
    refetchInterval: 30000,
  });

  // Real users from API
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminAPI.getUsers({ limit: 10 }),
    refetchInterval: 30000,
  });

  // Real pending projects from API
  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ["projects", { status: "pending" }],
    queryFn: () => projectsAPI.getAll({ status: "pending", limit: 10 }),
    refetchInterval: 15000,
  });

  const approveMutation = useMutation({
    mutationFn: (id) => adminAPI.approveProject(id),
    onSuccess: () => {
      toast.success("Project approved");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
    onError: () => toast.error("Failed to approve project"),
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => adminAPI.rejectProject(id),
    onSuccess: () => {
      toast.success("Project rejected");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
    onError: () => toast.error("Failed to reject project"),
  });

  const summary = analyticsData?.data?.summary || {
    totalUsers: 0,
    totalProjects: 0,
    activeDomains: 0,
    pendingApprovals: 0,
  };

  const users = usersData?.data?.users || [];
  const pendingProjects = pendingData?.data?.projects || [];

  return (
    <section id="admin-preview" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-background to-background" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Admin Dashboard
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Platform Analytics &amp; Management
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Live data from the repository — users, projects, and pending approvals updated in real time.
          </p>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Stats Row */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Users className="h-5 w-5" />} label="Total Users" value={summary.totalUsers} trend="live" delay={0} />
            <StatCard icon={<FolderGit2 className="h-5 w-5" />} label="Total Projects" value={summary.totalProjects} trend="live" delay={0.1} />
            <StatCard icon={<Activity className="h-5 w-5" />} label="Active Domains" value={summary.activeDomains || 0} trend="live" delay={0.2} />
            <StatCard icon={<Clock className="h-5 w-5" />} label="Pending Reviews" value={summary.pendingApprovals} trend="live" delay={0.3} />
          </div>

          {/* User Management — Real Data */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-foreground">Recent Members</h3>
                <p className="text-sm text-muted-foreground">Latest registered users (live)</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-green-500">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                LIVE
              </span>
            </div>

            {usersLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <Users className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, i) => (
                      <tr key={user.uid || i} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-medium text-primary">
                                {(user.name || user.email || "?").charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-sm">{user.name || "—"}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">
                            {user.role || "member"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {user.createdAt
                            ? format(new Date(user.createdAt._seconds ? user.createdAt._seconds * 1000 : user.createdAt), "MMM d, yyyy")
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Pending Projects Queue — Real Data */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-foreground">Moderation Queue</h3>
                <p className="text-sm text-muted-foreground">Projects pending approval</p>
              </div>
              <span className="px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-medium">
                {pendingProjects.length} pending
              </span>
            </div>

            {pendingLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : pendingProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-sm font-medium text-foreground">All clear!</p>
                <p className="text-xs text-muted-foreground mt-1">No projects waiting for review.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {pendingProjects.map((project) => (
                  <div key={project.id} className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{project.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {project.createdAt
                            ? format(new Date(project.createdAt._seconds ? project.createdAt._seconds * 1000 : project.createdAt), "MMM d, h:mm a")
                            : "Unknown date"}
                        </p>
                      </div>
                      <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.techStack?.slice(0, 3).map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-muted border border-border text-muted-foreground">{t}</span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveMutation.mutate(project.id)}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                        className="flex-1 py-1.5 rounded-lg bg-green-500/10 text-green-500 text-xs font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        {approveMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                        Approve
                      </button>
                      <button
                        onClick={() => rejectMutation.mutate(project.id)}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                        className="flex-1 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        {rejectMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}

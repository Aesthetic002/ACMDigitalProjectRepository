"use client";
import { motion } from "framer-motion";
import { useScrollAnimation, useCountUp } from "@/hooks/useScrollAnimation";
import {
  TrendingUp,
  Users,
  FolderGit2,
  Activity,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

// Mock Chart Component
function MockLineChart() {
  return (
    <div className="h-48 flex items-end justify-between gap-2 px-2">
      {[35, 45, 30, 55, 40, 60, 50, 70, 55, 75, 65, 80].map((height, i) => (
        <motion.div
          key={i}
          className="flex-1 bg-primary/20 rounded-t-sm relative group"
          initial={{ height: 0 }}
          animate={{ height: `${height}%` }}
          transition={{ duration: 0.8, delay: i * 0.05 }}
        >
          <div
            className="absolute inset-x-0 bottom-0 bg-primary/40 rounded-t-sm group-hover:bg-primary/60 transition-colors"
            style={{ height: `${height * 0.6}%` }}
          />
        </motion.div>
      ))}
    </div>
  );
}

function MockBarChart() {
  const data = [
    { label: "AI/ML", value: 42, color: "#8B5CF6" },
    { label: "Web", value: 56, color: "#3B82F6" },
    { label: "Security", value: 28, color: "#10B981" },
    { label: "Robotics", value: 19, color: "#F59E0B" },
    { label: "CP", value: 35, color: "#EF4444" },
  ];

  return (
    <div className="h-48 flex items-end justify-around gap-4 px-4">
      {data.map((item, i) => (
        <div
          key={item.label}
          className="flex flex-col items-center gap-2 flex-1"
        >
          <motion.div
            className="w-full rounded-t-lg relative"
            style={{ backgroundColor: `${item.color}30` }}
            initial={{ height: 0 }}
            animate={{ height: `${item.value * 2}px` }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
          >
            <div
              className="absolute inset-x-0 bottom-0 rounded-t-lg"
              style={{ backgroundColor: item.color, height: "60%" }}
            />
          </motion.div>
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

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

export function AdminAnalytics() {
  const { ref: sectionRef, isInView } = useScrollAnimation({ threshold: 0.1 });

  const users = [
    {
      name: "Alex Chen",
      email: "alex.chen@university.edu",
      role: "Admin",
      status: "Active",
    },
    {
      name: "Sarah Johnson",
      email: "sarah.j@university.edu",
      role: "Moderator",
      status: "Active",
    },
    {
      name: "Mike Williams",
      email: "mike.w@university.edu",
      role: "Member",
      status: "Pending",
    },
    {
      name: "Emily Davis",
      email: "emily.d@university.edu",
      role: "Member",
      status: "Active",
    },
  ];

  const moderationQueue = [
    {
      title: "New Project: Smart Campus",
      type: "Project",
      status: "pending",
      time: "2h ago",
    },
    {
      title: "Member: David Park",
      type: "Join Request",
      status: "pending",
      time: "5h ago",
    },
    {
      title: "Edit: ML Workshop",
      type: "Edit",
      status: "approved",
      time: "1d ago",
    },
  ];

  return (
    <section id="admin-preview" className="relative py-24 sm:py-32">
      {/* Background */}
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
            Powerful Analytics & Management
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools for administrators to monitor platform activity,
            manage users, and moderate content.
          </p>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Row */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Users className="h-5 w-5" />}
              label="Total Users"
              value={423}
              trend="+12%"
              delay={0}
            />

            <StatCard
              icon={<FolderGit2 className="h-5 w-5" />}
              label="Active Projects"
              value={156}
              trend="+8%"
              delay={0.1}
            />

            <StatCard
              icon={<Activity className="h-5 w-5" />}
              label="Monthly Views"
              value={8932}
              trend="+24%"
              delay={0.2}
            />

            <StatCard
              icon={<CheckCircle className="h-5 w-5" />}
              label="Approval Rate"
              value={94}
              trend="+3%"
              delay={0.3}
            />
          </div>

          {/* Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-foreground">
                  Platform Activity
                </h3>
                <p className="text-sm text-muted-foreground">
                  Monthly user engagement over time
                </p>
              </div>
              <select className="px-3 py-1.5 rounded-lg bg-muted text-sm text-muted-foreground border-0">
                <option>Last 12 months</option>
                <option>Last 6 months</option>
                <option>Last 30 days</option>
              </select>
            </div>
            <MockLineChart />
          </motion.div>

          {/* Domain Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <div className="mb-6">
              <h3 className="font-semibold text-foreground">
                Projects by Domain
              </h3>
              <p className="text-sm text-muted-foreground">
                Distribution across domains
              </p>
            </div>
            <MockBarChart />
          </motion.div>

          {/* User Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-foreground">
                  User Management
                </h3>
                <p className="text-sm text-muted-foreground">
                  Recent member activity
                </p>
              </div>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      User
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Role
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <tr
                      key={i}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              {user.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`flex items-center gap-1.5 text-xs font-medium ${
                            user.status === "Active"
                              ? "text-green-500"
                              : "text-yellow-500"
                          }`}
                        >
                          {user.status === "Active" ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-sm text-primary hover:underline">
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Moderation Queue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-foreground">
                  Moderation Queue
                </h3>
                <p className="text-sm text-muted-foreground">
                  Pending approvals
                </p>
              </div>
              <span className="px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-medium">
                3 pending
              </span>
            </div>

            <div className="space-y-3">
              {moderationQueue.map((item, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.type} • {item.time}
                      </p>
                    </div>
                    {item.status === "pending" ? (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  {item.status === "pending" && (
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 py-1.5 rounded-lg bg-green-500/10 text-green-500 text-xs font-medium hover:bg-green-500/20 transition-colors">
                        Approve
                      </button>
                      <button className="flex-1 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium hover:bg-red-500/20 transition-colors">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

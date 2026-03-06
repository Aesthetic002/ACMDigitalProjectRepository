"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { projectsAPI } from "@/api/projects.api";
import {
  FolderOpen,
  FileText,
  Users,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

function FeatureSlide({ title, description, children, align, icon, index }) {
  const { ref, isInView } = useScrollAnimation({ threshold: 0.2 });

  const isLeft = align === "left";

  return (
    <div
      ref={ref}
      className={`min-h-screen flex items-center py-20 ${index % 2 === 0 ? "bg-muted/30" : "bg-background"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${isLeft ? "" : "lg:flex-row-reverse"
            }`}
        >
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: isLeft ? -40 : 40, filter: "blur(10px)" }}
            animate={isInView ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={isLeft ? "lg:order-1" : "lg:order-2"}
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <div className="text-primary">{icon}</div>
            </div>

            <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {title}
            </h3>

            <p className="text-lg text-muted-foreground leading-relaxed">
              {description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {["Intuitive UI", "Real-time Updates", "Advanced Filtering"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-primary/5 text-primary text-sm font-medium"
                  >
                    {tag}
                  </span>
                ),
              )}
            </div>
          </motion.div>

          {/* Mockup */}
          <motion.div
            initial={{ opacity: 0, x: isLeft ? 40 : -40, filter: "blur(10px)" }}
            animate={isInView ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className={isLeft ? "lg:order-2" : "lg:order-1"}
          >
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl opacity-50" />

              {/* Mockup Card */}
              <div className="relative bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
                {children}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Mockup Components
function ProjectArchiveMockup() {
  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['mock-projects'],
    queryFn: () => projectsAPI.getAll({ limit: 4 }),
  });

  const projects = projectsData?.data?.projects?.slice(0, 4) || [
    {
      title: "Neural Network Visualizer",
      domain: "AI/ML",
      status: "approved",
    },
    {
      title: "Campus Navigation App",
      domain: "Web Dev",
      status: "approved",
    },
    {
      title: "Security Audit Tool",
      domain: "Cybersecurity",
      status: "approved",
    },
    {
      title: "Autonomous Drone Controller",
      domain: "Robotics",
      status: "pending",
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-lg font-semibold text-foreground">
            Project Archive
          </h4>
          <p className="text-sm text-muted-foreground">
            Manage and explore all chapter projects
          </p>
        </div>
        <button className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            readOnly
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted text-sm text-foreground placeholder:text-muted-foreground border-0"
          />
        </div>
        <button className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {/* Project List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : projects.map((project, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FolderOpen className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors text-sm line-clamp-1">
                    {project.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {project.domain || "General"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-1 rounded-full text-[10px] font-medium capitalize ${project.status === "approved"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-yellow-500/10 text-yellow-500"
                    }`}
                >
                  {project.status === "approved" ? "Active" : project.status}
                </span>
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectDetailMockup() {
  const { data: projectsData } = useQuery({
    queryKey: ['mock-project-detail'],
    queryFn: () => projectsAPI.getAll({ limit: 1 }),
  });

  const project = projectsData?.data?.projects?.[0] || {
    title: "Neural Network Visualizer",
    domain: "AI/ML",
    status: "approved",
    description: "An interactive visualization tool for understanding neural network architectures. Built with TensorFlow.js and D3.js for real-time model exploration.",
    techStack: ["TensorFlow", "React", "D3.js"]
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <span>Projects</span>
        <span>/</span>
        <span className="text-foreground line-clamp-1">{project.title}</span>
      </div>

      {/* Project Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h4 className="text-lg font-semibold text-foreground mb-1 line-clamp-1">
            {project.title}
          </h4>
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${project.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
              {project.status === 'approved' ? 'Active' : project.status}
            </span>
            <span className="text-xs text-muted-foreground">{project.domain || 'General'} Domain</span>
          </div>
        </div>
        <button className="hidden sm:block px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium">
          View Details
        </button>
      </div>

      {/* Content Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-lg bg-muted overflow-x-auto no-scrollbar">
        {["Overview", "Team", "Resources", "Activity"].map((tab, i) => (
          <button
            key={tab}
            className={`flex-1 py-1.5 px-3 rounded-md text-[10px] font-medium transition-colors whitespace-nowrap ${i === 0
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Content */}
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-muted/50">
          <h5 className="text-xs font-medium text-foreground mb-2">Description</h5>
          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
            {project.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-muted/50">
            <h5 className="text-xs font-medium text-foreground mb-2">Technologies</h5>
            <div className="flex flex-wrap gap-1">
              {(project.techStack || ["React", "Node.js"]).slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[9px]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-muted/50">
            <h5 className="text-xs font-medium text-foreground mb-2">Status</h5>
            <p className="text-[10px] text-muted-foreground capitalize">{project.status}</p>
            <p className="text-[9px] text-primary mt-1">Live in repo</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MemberDashboardMockup() {
  const members = [
    {
      name: "Alex Chen",
      role: "President",
      domain: "AI/ML",
      contributions: 24,
    },
    {
      name: "Sarah Johnson",
      role: "Vice President",
      domain: "Web Dev",
      contributions: 18,
    },
    {
      name: "Mike Williams",
      role: "Member",
      domain: "Cybersecurity",
      contributions: 12,
    },
    {
      name: "Emily Davis",
      role: "Member",
      domain: "Robotics",
      contributions: 9,
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-lg font-semibold text-foreground">
            Member Dashboard
          </h4>
          <p className="text-sm text-muted-foreground">
            Chapter member directory and stats
          </p>
        </div>
        <div className="flex gap-2">
          <button className="hidden sm:block px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium">
            Invite
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[
          { label: "Total", value: "423" },
          { label: "Active", value: "156" },
          { label: "New", value: "28" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-2 rounded-xl bg-muted/50 text-center"
          >
            <p className="text-lg font-bold text-foreground">{stat.value}</p>
            <p className="text-[9px] text-muted-foreground uppercase">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Member List */}
      <div className="space-y-2">
        {members.map((member, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-[10px] font-medium text-primary">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">{member.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {member.role}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-foreground">
                {member.contributions}
              </span>
              <span className="text-[10px] text-muted-foreground">pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminModerationMockup() {
  const queue = [
    {
      type: "Project Submission",
      title: "Blockchain Voting System",
      author: "John Doe",
      time: "2 hours ago",
    },
    {
      type: "Member Request",
      title: "New member: Lisa Wang",
      author: "System",
      time: "5 hours ago",
    },
    {
      type: "Edit Request",
      title: "Update: ML Workshop Materials",
      author: "Alex Chen",
      time: "1 day ago",
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-lg font-semibold text-foreground">
            Moderation Queue
          </h4>
          <p className="text-sm text-muted-foreground">
            Review and approve pending items
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500">
          <Clock className="h-4 w-4" />
          <span className="text-xs font-medium">{queue.length} pending</span>
        </div>
      </div>

      {/* Queue Items */}
      <div className="space-y-3">
        {queue.map((item, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-muted/50 border border-border hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-medium mb-1 ${item.type === "Project Submission"
                      ? "bg-blue-500/10 text-blue-500"
                      : item.type === "Member Request"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-purple-500/10 text-purple-500"
                    }`}
                >
                  {item.type}
                </span>
                <p className="text-sm font-medium text-foreground line-clamp-1">{item.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  by {item.author}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-1.5 rounded-lg bg-green-500/10 text-green-500 text-xs font-medium">
                Approve
              </button>
              <button className="flex-1 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeatureSlides() {
  const slides = [
    {
      title: "Project Archive View",
      description:
        "Browse, search, and filter through all chapter projects with an intuitive interface. Track project status, domains, and contributions in one centralized location.",
      icon: <FolderOpen className="h-7 w-7" />,
      align: "left",
      mockup: <ProjectArchiveMockup />,
    },
    {
      title: "Project Detail View",
      description:
        "Get comprehensive insights into each project with detailed descriptions, team information, technology stacks, and activity timelines.",
      icon: <FileText className="h-7 w-7" />,
      align: "right",
      mockup: <ProjectDetailMockup />,
    },
    {
      title: "Member Dashboard",
      description:
        "Manage chapter membership with detailed profiles, contribution tracking, and domain assignments. Foster collaboration across teams.",
      icon: <Users className="h-7 w-7" />,
      align: "left",
      mockup: <MemberDashboardMockup />,
    },
    {
      title: "Admin Moderation Panel",
      description:
        "Streamlined approval workflows for project submissions, member requests, and content updates. Maintain quality control effortlessly.",
      icon: <ShieldCheck className="h-7 w-7" />,
      align: "right",
      mockup: <AdminModerationMockup />,
    },
  ];

  return (
    <section id="features">
      {/* Section Header */}
      <div className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Platform Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Powerful Tools for Project Management
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore the comprehensive feature set designed to streamline ACM
            chapter operations.
          </p>
        </div>
      </div>

      {/* Feature Slides */}
      {slides.map((slide, index) => (
        <FeatureSlide
          key={slide.title}
          title={slide.title}
          description={slide.description}
          icon={slide.icon}
          align={slide.align}
          index={index}
        >
          {slide.mockup}
        </FeatureSlide>
      ))}
    </section>
  );
}


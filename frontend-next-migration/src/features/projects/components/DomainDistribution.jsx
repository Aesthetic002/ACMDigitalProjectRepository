"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Brain, Globe, Shield, Cpu, Code2, ArrowRight } from "lucide-react";
import { adminAPI } from "@/api/admin.api";

function DomainCard({
  icon,
  title,
  description,
  projectCount,
  memberCount,
  color,
  delay,
}) {
  const { ref, isInView } = useScrollAnimation({ threshold: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="group relative"
    >
      <div
        className="relative h-full p-6 sm:p-8 rounded-2xl bg-card border border-border overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-card-hover dark:hover:shadow-card-hover-dark"
        style={{
          "--glow-color": color,
        }}
      >
        {/* Glow Effect on Hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${color}15 0%, transparent 70%)`,
          }}
        />

        {/* Border Glow */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 0 1px ${color}40, 0 0 30px -10px ${color}40`,
          }}
        />

        <div className="relative z-10">
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${color}15` }}
          >
            <div style={{ color }}>{icon}</div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-[var(--glow-color)] transition-colors duration-300">
            {title}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground text-sm leading-relaxed mb-5">
            {description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-5">
            <div>
              <p className="text-2xl font-bold text-foreground">
                {projectCount}
              </p>
              <p className="text-xs text-muted-foreground">Projects</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {memberCount}
              </p>
              <p className="text-xs text-muted-foreground">Members</p>
            </div>
          </div>

          {/* CTA */}
          <button
            className="flex items-center gap-2 text-sm font-medium transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
            style={{ color }}
          >
            Explore Domain
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function DomainDistribution() {
  const { ref: sectionRef, isInView } = useScrollAnimation({ threshold: 0.1 });

  const { data: analyticsData } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminAPI.getAnalytics(),
  });

  const domainStats = analyticsData?.data?.distribution || {};

  const domains = [
    {
      id: "ai-ml",
      icon: <Brain className="h-7 w-7" />,
      title: "AI / Machine Learning",
      description:
        "Deep learning, computer vision, NLP, and intelligent systems projects pushing the boundaries of AI.",
      projectCount: domainStats["AI / Machine Learning"]?.count || 0,
      memberCount: domainStats["AI / Machine Learning"]?.members || 0,
      color: "#8B5CF6",
    },
    {
      id: "web-dev",
      icon: <Globe className="h-7 w-7" />,
      title: "Web Development",
      description:
        "Full-stack applications, progressive web apps, and modern web technologies for real-world solutions.",
      projectCount: domainStats["Web Development"]?.count || 0,
      memberCount: domainStats["Web Development"]?.members || 0,
      color: "#3B82F6",
    },
    {
      id: "cybersecurity",
      icon: <Shield className="h-7 w-7" />,
      title: "Cybersecurity",
      description:
        "Security audits, penetration testing, cryptography, and defensive security implementations.",
      projectCount: domainStats["Cybersecurity"]?.count || 0,
      memberCount: domainStats["Cybersecurity"]?.members || 0,
      color: "#10B981",
    },
    {
      id: "robotics",
      icon: <Cpu className="h-7 w-7" />,
      title: "Robotics",
      description:
        "Autonomous systems, robotic control, sensor integration, and hardware-software interfaces.",
      projectCount: domainStats["Robotics"]?.count || 0,
      memberCount: domainStats["Robotics"]?.members || 0,
      color: "#F59E0B",
    },
    {
      id: "cp",
      icon: <Code2 className="h-7 w-7" />,
      title: "Competitive Programming",
      description:
        "Algorithm optimization, data structures, and competitive coding challenge solutions.",
      projectCount: domainStats["Competitive Programming"]?.count || 0,
      memberCount: domainStats["Competitive Programming"]?.members || 0,
      color: "#EF4444",
    },
  ];

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-acm-blue/10 text-acm-blue text-sm font-black uppercase tracking-widest mb-4">
            Domain Expertise
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 uppercase italic tracking-tight">
            Diverse Technical <span className="text-gradient-acm">Domains.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
            Our chapter spans multiple technology domains, fostering expertise
            and innovation across disciplines.
          </p>
        </motion.div>

        {/* Domain Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {domains.map((domain, index) => (
            <DomainCard key={domain.title} {...domain} delay={index * 0.1} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 text-center"
        >
          <p className="text-muted-foreground mb-6 font-medium italic">
            Want to contribute to a domain or start a new one?
          </p>
          <button className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-acm-blue text-white font-black uppercase tracking-widest text-xs hover:bg-acm-blue-dark transition-all shadow-acm-glow hover:shadow-acm-glow-strong transform hover:scale-105 active:scale-95">
            Get Involved Now
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}


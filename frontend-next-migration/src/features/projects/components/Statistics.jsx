"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useCountUp, useScrollAnimation } from "@/hooks/useScrollAnimation";
import { FolderGit2, Users, Layers, Calendar } from "lucide-react";
import { adminAPI } from "@/api/admin.api";

function StatCard({ icon, value, label, suffix = "", delay }) {
  const { count, ref } = useCountUp(value, 2000);
  const { ref: animRef, isInView } = useScrollAnimation({ threshold: 0.3 });

  return (
    <motion.div
      ref={animRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="group relative"
    >
      <div className="relative p-8 rounded-[2rem] bg-card/40 backdrop-blur-xl border border-border/50 hover:border-acm-blue/50 transition-all duration-500 hover:shadow-acm-glow hover:-translate-y-2">
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-[2rem] bg-acm-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-acm-blue/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-acm-blue group-hover:text-white transition-all duration-500 shadow-lg shadow-acm-blue/5">
            <div className="transition-colors duration-500">{icon}</div>
          </div>

          <div
            className="text-5xl font-black text-white mb-2 tracking-tighter italic"
          >
            <span ref={ref}>
              {count}
              <span className="text-acm-blue">{suffix}</span>
            </span>
          </div>

          {/* Label */}
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
            {label}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function Statistics() {
  const { ref: sectionRef, isInView } = useScrollAnimation({ threshold: 0.1 });

  const { data: analyticsData } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminAPI.getAnalytics(),
  });

  const stats = [
    {
      icon: <FolderGit2 className="h-6 w-6" />,
      value: analyticsData?.data?.summary?.totalProjects || 0,
      label: "Total Projects",
      suffix: "+",
    },
    {
      icon: <Users className="h-6 w-6" />,
      value: analyticsData?.data?.summary?.totalUsers || 0,
      label: "Total Members",
      suffix: "",
    },
    {
      icon: <Layers className="h-6 w-6" />,
      value: analyticsData?.data?.summary?.activeDomains || 0,
      label: "Active Domains",
      suffix: "",
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      value: analyticsData?.data?.summary?.totalEvents || 0,
      label: "Total Events",
      suffix: "",
    },
  ];

  return (
    <section className="relative py-24 sm:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
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
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Platform Metrics
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Growing Community of Innovators
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform tracks the progress and achievements of ACM chapter
            members across various domains and projects.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              suffix={stat.suffix}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}


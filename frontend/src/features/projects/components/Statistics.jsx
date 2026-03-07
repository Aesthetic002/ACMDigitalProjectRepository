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
      <div className="relative p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-card-hover dark:hover:shadow-card-hover-dark hover:-translate-y-1">
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <div className="text-primary">{icon}</div>
          </div>

          {/* Value */}
          <div
            ref={ref}
            className="text-4xl sm:text-5xl font-bold text-foreground mb-2"
          >
            {count}
            <span className="text-primary">{suffix}</span>
          </div>

          {/* Label */}
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
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
      icon: <Calendar className="h-6 w-6" />,
      value: analyticsData?.data?.summary?.totalEvents || 48,
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
        <div className="flex justify-center">
          <div className="w-full max-w-sm">
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
      </div>
    </section>
  );
}


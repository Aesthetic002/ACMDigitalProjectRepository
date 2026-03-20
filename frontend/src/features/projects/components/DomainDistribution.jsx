"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Brain, Globe, Shield, Cpu, Code2, ArrowRight, Layers, Hash, Sparkles } from "lucide-react";
import { tagsAPI } from "@/services/api";

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

const colorMap = [
    "#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444",
    "#06B6D4", "#F43F5E", "#84CC16", "#EC4899", "#6366F1"
];

const iconMap = {
    "Artificial Intelligence": <Brain className="h-7 w-7" />,
    "Web Development": <Globe className="h-7 w-7" />,
    "Machine Learning": <Sparkles className="h-7 w-7" />,
    "Cybersecurity": <Shield className="h-7 w-7" />,
    "Blockchain": <Layers className="h-7 w-7" />,
    "Cloud Computing": <Cpu className="h-7 w-7" />,
    "Internet of Things": <Cpu className="h-7 w-7" />,
    "Data Science": <Layers className="h-7 w-7" />,
    "Mobile Apps": <Globe className="h-7 w-7" />,
    "DevOps": <Code2 className="h-7 w-7" />
};

const descMap = {
    "Artificial Intelligence": "Pushing the boundaries of what systems can achieve with neural networks.",
    "Web Development": "Building the next generation of scalable web platforms and applications.",
    "Machine Learning": "Transforming raw data into predictive insights and automated decisions.",
    "Cybersecurity": "Defending digital assets and ensuring the integrity of modern systems.",
    "Blockchain": "Decentralized ledgers and trustless systems for secure transactions.",
    "Cloud Computing": "Architecting modern infrastructure at global scale.",
    "Internet of Things": "Connecting the physical world with intelligent software systems.",
    "Data Science": "Mining insights from complex datasets to drive innovation.",
    "Mobile Apps": "Crafting native and cross-platform experiences for the modern user.",
    "DevOps": "Streamlining software delivery and operational excellence."
};

export function DomainDistribution() {
  const { ref: sectionRef, isInView } = useScrollAnimation({ threshold: 0.1 });

  const { data: tagsRes } = useQuery({
    queryKey: ['public-tags'],
    queryFn: () => tagsAPI.getAll(),
  });

  const tagsList = tagsRes?.data?.tags || [];

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Domain Expertise
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 italic uppercase tracking-tight">
            Active Technical Domains
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our chapter spans multiple technology domains, fostering expertise
            and innovation across disciplines.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tagsList.length > 0 ? (
            tagsList.map((tag, index) => (
              <DomainCard 
                key={tag.id || tag.name} 
                title={tag.name}
                description={descMap[tag.name] || "Expertise and innovation across technical disciplines."}
                projectCount={tag.projectCount || 0}
                icon={iconMap[tag.name] || <Hash className="h-7 w-7" />}
                color={colorMap[index % colorMap.length]}
                delay={index * 0.05} 
              />
            ))
          ) : (
             [1,2,3].map(i => <div key={i} className="h-64 rounded-2xl bg-card border border-border animate-pulse" />)
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-4 italic">
            Want to contribute to a domain or start a new one?
          </p>
          <button onClick={() => window.location.href='/submit'} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-black tracking-widest uppercase italic hover:bg-primary/90 transition-colors shadow-acm-glow hover:shadow-acm-glow-strong">
            Submit Project
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

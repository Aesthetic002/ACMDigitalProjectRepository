"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FolderOpen, Shield, ChevronDown } from "lucide-react";
import { useDecryptText } from "@/hooks/useDecryptText";

export function Hero() {
  const { displayText, ref: decryptRef } = useDecryptText({
    text: "Centralized Repository for ACM Chapter Projects",
    duration: 2000,
    delay: 500,
  });

  const scrollToFeatures = () => {
    const element = document.getElementById("features");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToAdmin = () => {
    const element = document.getElementById("admin-preview");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-acm-blue-light/50 via-background to-background dark:from-acm-navy dark:via-background dark:to-background transition-colors duration-500" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            ACM Chapter Initiative
          </span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
        >
          <span className="text-foreground">ACM Project </span>
          <span className="text-gradient-acm">Archive Platform</span>
        </motion.h1>

        {/* Subtitle with Decrypt Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          ref={decryptRef}
          className="mb-10"
        >
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-mono min-h-[2rem]">
            {displayText}
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Button
            size="lg"
            variant="acm"
            onClick={scrollToFeatures}
            className="group px-8 py-6 text-lg rounded-2xl shadow-acm-glow hover:shadow-acm-glow-strong"
          >
            <FolderOpen className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Explore Projects
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={scrollToAdmin}
            className="group px-8 py-6 text-lg rounded-2xl border-2 border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all"
          >
            <Shield className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Admin Panel Preview
          </Button>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {[
            "Project Management",
            "Member Directory",
            "Analytics",
            "Moderation",
          ].map((feature) => (
            <span
              key={feature}
              className="px-5 py-2.5 rounded-xl glass-effect text-sm font-bold text-muted-foreground hover:border-primary/50 hover:text-primary transition-all duration-300 cursor-default"
            >
              {feature}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.button
          onClick={scrollToFeatures}
          className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-sm">Scroll to explore</span>
          <ChevronDown className="h-5 w-5" />
        </motion.button>
      </motion.div>
    </section>
  );
}

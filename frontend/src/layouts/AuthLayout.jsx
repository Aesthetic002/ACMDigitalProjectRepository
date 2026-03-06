"use client";

import { motion } from "framer-motion";
import { ThemeToggle } from "@/hooks/useTheme";

export default function AuthLayout({ children }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                        backgroundSize: "48px 48px",
                    }}
                />
            </div>

            <div className="absolute top-8 right-8 z-50">
                <ThemeToggle />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md px-4 relative z-10"
            >
                {children}
            </motion.div>

            {/* Hero-like glow shells */}
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
            <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        </div>
    );
}

"use client";

import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-10 h-10 rounded-xl bg-muted/20 animate-pulse border border-border/50" />;
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-border/50"
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
                <Moon className="h-4 w-4 text-acm-blue" />
            ) : (
                <Sun className="h-4 w-4 text-amber-500" />
            )}
        </Button>
    );
}

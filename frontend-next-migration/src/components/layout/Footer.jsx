"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Github, Twitter, Linkedin, Mail, Heart, Globe, BookOpen, HelpCircle } from "lucide-react";

export default function Footer() {
    const { ref, isInView } = useScrollAnimation({ threshold: 0.1 });

    const links = {
        repository: [
            { label: "Archive", href: "/projects" },
            { label: "Search", href: "/search" },
            { label: "Submit", href: "/submit" },
            { label: "My Profile", href: "/profile" },
        ],
        resources: [
            { label: "Documentation", href: "#", icon: BookOpen },
            { label: "Guidelines", href: "#", icon: Globe },
            { label: "Support", href: "#", icon: HelpCircle },
        ],
        chapter: [
            { label: "About ACM", href: "#" },
            { label: "Events", href: "#" },
            { label: "Contact", href: "#" },
        ],
    };

    const socials = [
        { icon: Github, href: "#", label: "GitHub" },
        { icon: Twitter, href: "#", label: "Twitter" },
        { icon: Linkedin, href: "#", label: "LinkedIn" },
        { icon: Mail, href: "#", label: "Email" },
    ];

    return (
        <footer className="relative pt-20 pb-8 border-t border-border">
            <div className="absolute inset-0 bg-gradient-to-t from-muted/50 to-background" />
            <div ref={ref} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-2"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-acm-blue flex items-center justify-center shadow-lg shadow-acm-blue/20">
                                <span className="text-white font-black text-sm">ACM</span>
                            </div>
                            <div className="flex flex-col leading-none">
                                <h4 className="font-black text-white text-xl tracking-tighter uppercase italic">Digital</h4>
                                <span className="text-[10px] font-bold text-acm-blue uppercase tracking-widest leading-none mt-0.5">Project Repository</span>
                            </div>
                        </div>
                        <p className="text-muted-foreground mb-8 max-w-sm text-sm leading-relaxed">
                            Accelerating innovation within the ACM chapter through a centralized, searchable repository of student and faculty projects.
                        </p>
                        <div className="flex gap-3">
                            {socials.map((social) => (
                                <a key={social.label} href={social.href}
                                    className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300"
                                    aria-label={social.label}>
                                    <social.icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                    </motion.div>

                    {Object.entries(links).map(([category, items], categoryIndex) => (
                        <motion.div
                            key={category}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.1 * (categoryIndex + 1) }}
                        >
                            <h4 className="font-semibold text-foreground mb-4 capitalize">{category}</h4>
                            <ul className="space-y-3">
                                {items.map((item) => (
                                    <li key={item.label}>
                                        <Link href={item.href} className="text-muted-foreground hover:text-acm-blue transition-all duration-200 flex items-center gap-2 group text-sm font-medium">
                                            {item.icon && <item.icon className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100" />}
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="pt-8 border-t border-border"
                >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground text-center sm:text-left">
                            © {new Date().getFullYear()} ACM Chapter. All rights reserved.
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for the ACM community
                        </p>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
}

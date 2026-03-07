import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { ArrowRight, Rocket, Sparkles } from 'lucide-react';

export function AnimatedHero() {
    const pillars = [92, 84, 78, 70, 62, 54, 46, 34, 18, 34, 46, 54, 62, 70, 78, 84, 92];
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <style>
                {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes subtlePulse {
            0%, 100% {
              opacity: 0.8;
              transform: scale(1);
            }
            50% {
              opacity: 1;
              transform: scale(1.03);
            }
          }
          
          .animate-fadeInUp {
            animation: fadeInUp 0.8s ease-out forwards;
          }
        `}
            </style>

            <section className="relative isolate min-h-[100vh] overflow-hidden bg-black text-white">
                {/* ================== BACKGROUND ================== */}
                <div
                    aria-hidden
                    className="absolute inset-0 -z-30"
                    style={{
                        backgroundImage: [
                            "radial-gradient(80% 55% at 50% 52%, rgba(16,185,129,0.25) 0%, rgba(5,150,105,0.28) 27%, rgba(24,24,27,0.38) 47%, rgba(24,24,27,0.50) 60%, rgba(9,9,11,0.92) 78%, rgba(0,0,0,1) 88%)",
                            "radial-gradient(85% 60% at 14% 0%, rgba(139,92,246,0.35) 0%, rgba(109,40,217,0.28) 30%, rgba(24,24,27,0.0) 64%)",
                            "radial-gradient(70% 50% at 86% 22%, rgba(16,185,129,0.30) 0%, rgba(9,9,11,0.0) 55%)",
                            "linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0) 40%)",
                        ].join(","),
                        backgroundColor: "#09090b",
                    }}
                />

                {/* Vignette */}
                <div aria-hidden className="absolute inset-0 -z-20 bg-[radial-gradient(140%_120%_at_50%_0%,transparent_60%,rgba(0,0,0,0.85))]" />

                {/* Grid overlay */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -z-10 mix-blend-screen opacity-15"
                    style={{
                        backgroundImage: [
                            "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 96px)",
                            "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 24px)",
                            "repeating-radial-gradient(80% 55% at 50% 52%, rgba(255,255,255,0.04) 0 1px, transparent 1px 120px)"
                        ].join(","),
                        backgroundBlendMode: "screen",
                    }}
                />

                {/* ================== COPY ================== */}
                <div className="relative z-10 mx-auto grid w-full max-w-5xl place-items-center px-6 pt-32 pb-16 md:pt-40 lg:pt-44">
                    <div className={`mx-auto text-center ${isMounted ? 'animate-fadeInUp' : 'opacity-0'}`}>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-[11px] uppercase tracking-wider text-white/60 ring-1 ring-white/10 backdrop-blur">
                            <Sparkles className="w-3.5 h-3.5 text-primary-400" /> ACM Project Archive
                        </span>

                        <h1 style={{ animationDelay: '200ms' }} className={`mt-8 text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl ${isMounted ? 'animate-fadeInUp' : 'opacity-0'}`}>
                            <span className="text-white">Discover Amazing</span>
                            <br />
                            <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-primary-300 bg-clip-text text-transparent">Student Projects</span>
                        </h1>

                        <p style={{ animationDelay: '300ms' }} className={`mx-auto mt-6 max-w-2xl text-balance text-white/60 md:text-lg ${isMounted ? 'animate-fadeInUp' : 'opacity-0'}`}>
                            A platform for ACM club members to showcase their innovative projects,
                            collaborate with peers, and inspire the next generation of developers.
                        </p>

                        <div style={{ animationDelay: '400ms' }} className={`mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row ${isMounted ? 'animate-fadeInUp' : 'opacity-0'}`}>
                            <Link to="/projects" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-500 px-7 py-3.5 text-sm font-semibold text-white shadow transition hover:bg-primary-400 hover:shadow-lg hover:shadow-primary-500/20">
                                Explore Projects
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link to="/projects/new" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold text-white/80 backdrop-blur hover:border-white/30 hover:bg-white/5">
                                <Rocket className="w-4 h-4" />
                                Submit Your Project
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ================== STATS ================== */}
                <div className="relative z-10 mx-auto mt-4 w-full max-w-4xl px-6">
                    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-50">
                        {["React", "Python", "TensorFlow", "Node.js", "Flutter", "Firebase", "Docker", "AWS"].map((brand) => (
                            <div key={brand} className="text-xs uppercase tracking-wider text-white/50 font-medium">{brand}</div>
                        ))}
                    </div>
                </div>

                {/* ================== FOREGROUND ================== */}
                {/* Center-bottom glow */}
                <div
                    className="pointer-events-none absolute bottom-[128px] left-1/2 z-0 h-36 w-28 -translate-x-1/2 rounded-md bg-gradient-to-b from-primary-400/50 via-accent-400/30 to-transparent"
                    style={{ animation: 'subtlePulse 6s ease-in-out infinite' }}
                />

                {/* Stepped pillars silhouette */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[54vh]">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/90 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex h-full items-end gap-px px-[2px]">
                        {pillars.map((h, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-[#09090b] transition-height duration-1000 ease-in-out"
                                style={{
                                    height: isMounted ? `${h}%` : '0%',
                                    transitionDelay: `${Math.abs(i - Math.floor(pillars.length / 2)) * 60}ms`
                                }}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}

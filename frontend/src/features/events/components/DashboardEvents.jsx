import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Calendar,
    MapPin,
    Clock,
    ArrowRight,
    Sparkles,
    Loader2,
    Bell,
    ChevronRight
} from "lucide-react";
import { eventService } from "@/services/eventService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

export function DashboardEvents() {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuthStore();
    
    useEffect(() => {
        const fetchEvents = async () => {
            const result = await eventService.getEvents();
            if (result.success && result.events) {
                setEvents(result.events);
            }
            setIsLoading(false);
        };
        fetchEvents();
    }, []);

    if (isLoading) {
        return (
            <div className="py-20 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const hasEvents = events.length > 0;

    return (
        <section className="py-24 relative bg-slate-950/50">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

            <div className="container mx-auto px-4 relative z-10 w-full flex flex-col justify-center">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 pl-4 md:pl-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-4xl md:text-5xl md:text-6xl font-black tracking-tight text-white italic relative z-20">
                                Level Up your <span className="text-primary italic">Network.</span>
                            </h2>
                        </div>
                    </div>

                    <Link to="/events" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest z-20 bg-background/50 px-4 py-2 rounded-full backdrop-blur-md border border-border/50">
                        View full calendar <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="flex overflow-x-auto snap-x snap-mandatory gap-8 px-4 md:px-8 pb-12 w-full hide-scrollbar scroll-smooth">
                    {hasEvents ? (
                        events.map((event, index) => (
                            <div
                                key={event.id}
                                className="group relative w-[85vw] md:w-[450px] lg:w-[450px] flex-shrink-0 h-[400px] snap-start"
                            >
                                <div className="h-full p-8 md:p-10 rounded-[2.5rem] border border-border/50 bg-card/60 backdrop-blur-2xl transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_40px_rgba(var(--primary),0.15)] hover:-translate-y-2 overflow-hidden flex flex-col items-start justify-between relative group-hover:bg-card/80">
                                    
                                    {/* Decorative background element */}
                                    <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-5 group-hover:opacity-10 group-hover:rotate-12 group-hover:scale-110 transition-all duration-700">
                                        <Sparkles className="h-32 w-32 text-primary" />
                                    </div>

                                    <div className="w-full">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="p-4 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_0_20px_rgba(var(--primary),0.5)] transition-all duration-500 transform group-hover:-rotate-3 group-hover:scale-110">
                                                <Calendar className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-widest text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]">
                                                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                                <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1">
                                                    <Clock className="h-3.5 w-3.5" /> {event.time}
                                                </div>
                                            </div>
                                        </div>

                                        <h3 className="text-3xl md:text-3xl font-black text-white mb-4 group-hover:text-primary transition-colors duration-300 uppercase leading-none italic tracking-tight">{event.title}</h3>
                                        <p className="text-muted-foreground text-sm md:text-base line-clamp-3 leading-relaxed italic pr-8">{event.description}</p>
                                    </div>

                                    <div className="w-full flex items-center justify-between pt-6 border-t border-border/30 z-10">
                                        <div className="flex items-center gap-3 text-muted-foreground bg-background/50 px-4 py-2 rounded-xl backdrop-blur-md max-w-[70%]">
                                            <MapPin className="h-4 w-4 text-primary animate-pulse flex-shrink-0" />
                                            <span className="text-xs font-bold uppercase tracking-wider truncate">{event.location}</span>
                                        </div>
                                        <Button variant="ghost" size="icon" className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all transform group-hover:translate-x-2 group-hover:scale-110 h-10 w-10">
                                            <ChevronRight className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="w-full flex flex-col justify-center items-center text-center border-2 border-dashed border-border/50 rounded-[2.5rem] bg-card/20 backdrop-blur-xl py-24">
                            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-20" />
                            <h3 className="text-2xl font-black text-white/50 mb-3 uppercase italic">No Events Scheduled</h3>
                            <p className="text-base text-muted-foreground max-w-md mx-auto italic">
                                We're currently planning some exciting gatherings. Check back soon for updates!
                            </p>
                        </div>
                    )}
                    
                    {/* Decorative End Marker */}
                    {hasEvents && events.length > 0 && (
                        <div className="flex-shrink-0 w-[40vw] md:w-[300px] flex items-center justify-center opacity-50 group cursor-pointer snap-start pr-12 md:pr-24" onClick={() => window.location.href='/events'}>
                            <div className="flex flex-col items-center gap-4 hover:scale-105 transition-transform duration-500">
                                <div className="h-16 w-16 rounded-full bg-border/30 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-500 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/50 transition-colors" />
                                    <ArrowRight className="h-8 w-8 relative z-10" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest italic text-muted-foreground group-hover:text-primary transition-colors whitespace-nowrap">See all {events.length} events</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
}

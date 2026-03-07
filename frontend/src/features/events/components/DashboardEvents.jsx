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
    Bell
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { eventService } from "@/services/eventService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function DashboardEvents() {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { ref: sectionRef, isInView } = useScrollAnimation({ threshold: 0.1 });

    useEffect(() => {
        const fetchEvents = async () => {
            const result = await eventService.getEvents();
            if (result.success) {
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

    if (events.length === 0) {
        return null; // Don't show anything if no events
    }

    return (
        <section ref={sectionRef} className="py-24 relative overflow-hidden bg-slate-950/50">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 py-1 px-3">
                                <Bell className="h-3 w-3 mr-2 animate-bounce" /> UPCOMING EVENTS
                            </Badge>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white italic">
                            Level Up your <span className="text-primary italic">Network.</span>
                        </h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <Link to="/events" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                            View full calendar <ArrowRight className="h-4 w-4" />
                        </Link>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.slice(0, 3).map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group relative"
                        >
                            <div className="h-full p-8 rounded-[2.5rem] border border-border/50 bg-card/40 backdrop-blur-xl transition-all duration-500 hover:border-primary/50 hover:shadow-acm-glow overflow-hidden flex flex-col">
                                {/* Decorative background element */}
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Sparkles className="h-24 w-24 text-primary" />
                                </div>

                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                                        <Calendar className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-primary">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                                            <Clock className="h-3 w-3" /> {event.time}
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-white mb-4 group-hover:text-primary transition-colors duration-300 uppercase leading-none italic">{event.title}</h3>
                                <p className="text-muted-foreground text-sm line-clamp-3 mb-8 flex-grow leading-relaxed italic">{event.description}</p>

                                <div className="flex items-center justify-between pt-6 border-t border-border/30 mt-auto">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        <span className="text-xs font-bold uppercase tracking-wider">{event.location}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary hover:text-white transition-all transform group-hover:translate-x-1">
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { eventService } from "@/services/eventService";
import Layout from "@/components/Layout";

export default function EventsPage() {
    const [searchTerm, setSearchTerm] = useState("");



    const { data: eventsList = [], isLoading } = useQuery({
        queryKey: ["public-events"],
        queryFn: async () => {
            const res = await eventService.getEvents();
            return (res.success && res.events) ? res.events : [];
        }
    });

    const filteredEvents = eventsList.filter(e => 
        e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout>
            <div className="container mx-auto px-4 py-24 min-h-screen">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-2xl bg-acm-blue/20 flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-acm-blue" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-acm-blue">Calendar</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white italic uppercase">
                            Upcoming <span className="text-acm-blue">Events</span>
                        </h1>
                        <p className="text-slate-400 mt-4 max-w-2xl font-medium leading-relaxed">
                            Join us for workshops, hackathons, and networking sessions designed to help you level up your skills.
                        </p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border-border/50 pl-11 rounded-2xl h-14 text-white placeholder:text-slate-500 focus-visible:ring-acm-blue"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="h-10 w-10 text-acm-blue animate-spin" />
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="bg-card/30 border border-border/50 rounded-3xl p-16 text-center backdrop-blur-sm">
                        <Calendar className="h-16 w-16 text-slate-500 mx-auto mb-6 opacity-20" />
                        <h3 className="text-2xl font-black text-white mb-2 uppercase italic">No Events Found</h3>
                        <p className="text-slate-400 font-medium">Try adjusting your search terms or check back later.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredEvents.map((event) => (
                            <div key={event.id} className="group flex flex-col h-full bg-card/30 border border-border/50 rounded-[2.5rem] p-8 hover:bg-white/5 hover:border-acm-blue/50 transition-all duration-300">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-14 w-14 rounded-2xl bg-acm-blue/20 text-acm-blue flex flex-col items-center justify-center group-hover:bg-acm-blue group-hover:text-white transition-colors duration-300">
                                        <span className="text-xs font-black uppercase">{event.date ? format(new Date(event.date), 'MMM') : 'TBA'}</span>
                                        <span className="text-lg font-black leading-none mt-1">{event.date ? format(new Date(event.date), 'dd') : '--'}</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-wider">
                                            <Clock className="h-3.5 w-3.5" />
                                            {event.time || 'TBA'}
                                        </div>
                                    </div>
                                </div>
                                
                                <h3 className="text-2xl font-black text-white mb-4 leading-tight group-hover:text-acm-blue transition-colors italic uppercase">
                                    {event.title}
                                </h3>
                                
                                <p className="text-slate-400 text-sm mb-8 flex-grow leading-relaxed">
                                    {event.description}
                                </p>
                                
                                <div className="mt-auto pt-6 border-t border-border/30 flex items-center gap-3 text-slate-300 font-medium">
                                    <MapPin className="h-4 w-4 text-acm-blue flex-shrink-0" />
                                    <span className="truncate">{event.location || 'Location TBA'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}

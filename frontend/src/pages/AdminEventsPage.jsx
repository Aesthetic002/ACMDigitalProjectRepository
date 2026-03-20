import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar, Plus, Edit3, Trash2, Clock, MapPin, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { eventService } from "@/services/eventService";
import { useAuthStore } from "@/store/authStore";

export default function AdminEventsPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState("");

    const demoEvents = [
        {
            id: 'de1', title: 'Spring Hackathon 2026',
            description: '48-hour coding marathon to build solutions for social good.',
            date: '2026-04-15', time: '09:00 AM', location: 'Main Engineering Hall',
            createdAt: new Date().toISOString()
        },
        {
            id: 'de2', title: 'AI Workshop: Neural Networks',
            description: 'Hands-on introduction to building deep learning models.',
            date: '2026-03-25', time: '02:00 PM', location: 'Room 302',
            createdAt: new Date().toISOString()
        },
        {
            id: 'de3', title: 'Career Fair Mixer',
            description: 'Network with industry leaders from Google, Meta, etc.',
            date: '2026-03-30', time: '05:30 PM', location: 'Student Union Ballroom',
            createdAt: new Date().toISOString()
        }
    ];

    const { data: eventsList = [], isLoading } = useQuery({
        queryKey: ["admin-events"],
        queryFn: async () => {
            const res = await eventService.getEvents();
            if (res.success) {
                if (user?.isDemoUser) {
                    const realEvents = res.events || [];
                    const combined = [...realEvents];
                    demoEvents.forEach(de => {
                        if (!combined.some(e => e.title === de.title)) {
                            combined.push(de);
                        }
                    });
                    return combined;
                }
                return res.events || [];
            } else if (user?.isDemoUser) {
                return demoEvents;
            }
            throw new Error(res.error || "Failed to fetch events");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => eventService.deleteEvent(id),
        onSuccess: () => {
            toast.success("Event deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["admin-events"] });
            queryClient.invalidateQueries({ queryKey: ["events"] });
        },
        onError: () => toast.error("Failed to delete event")
    });

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
            deleteMutation.mutate(id);
        }
    };

    const filteredEvents = eventsList.filter(e => 
        e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Calendar className="text-white h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Events</h1>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-1">
                            Manage community gatherings
                        </p>
                    </div>
                </div>
                <Link to="/admin/events/new">
                    <Button className="h-12 px-6 rounded-2xl bg-white text-slate-950 font-black tracking-widest uppercase italic shadow-acm-glow hover:bg-white/90 gap-2">
                        <Plus className="h-5 w-5" /> CREATE EVENT
                    </Button>
                </Link>
            </div>

            <div className="bg-card/40 border border-border/50 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search events by title, location, or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-muted/50 border-border/50 pl-11 rounded-xl h-12"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                        <Calendar className="h-10 w-10 mb-4 opacity-20" />
                        <p className="font-medium text-lg text-white">No active events found</p>
                        <p className="text-sm">Click 'Create Event' to add one to the calendar.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-border/50 bg-slate-950/50">
                        <table className="w-full text-left">
                            <thead className="bg-muted/30 border-b border-border/50">
                                <tr className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                    <th className="p-4 rounded-tl-2xl">Event Details</th>
                                    <th className="p-4">Schedule</th>
                                    <th className="p-4">Location</th>
                                    <th className="p-4 text-right rounded-tr-2xl">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {filteredEvents.map((event) => (
                                    <tr key={event.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="font-bold text-white text-base">{event.title}</div>
                                            <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs mt-1">
                                                {event.description}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-300 font-medium whitespace-nowrap">
                                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                                <span>{event.date ? format(new Date(event.date), 'MMM d, yyyy') : 'TBD'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 whitespace-nowrap">
                                                <Clock className="h-3 w-3" />
                                                <span>{event.time || 'TBD'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-300 font-medium max-w-[200px] truncate">
                                                <MapPin className="h-3.5 w-3.5 text-acm-blue flex-shrink-0" />
                                                <span className="truncate">{event.location || 'TBD'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link to={`/admin/events/${event.id}/edit`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg">
                                                        <Edit3 className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleDelete(event.id)}
                                                    className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

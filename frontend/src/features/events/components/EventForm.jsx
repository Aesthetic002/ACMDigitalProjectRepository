import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    Calendar,
    Clock,
    MapPin,
    FileText,
    Loader2,
    Plus,
    ArrowLeft
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { eventService } from "@/services/eventService";

export default function EventForm() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.location) {
            return toast.error("Please fill in all fields");
        }

        setIsLoading(true);
        const result = await eventService.createEvent(formData);
        setIsLoading(false);

        if (result.success) {
            toast.success("Event created successfully!");
            navigate("/");
        } else {
            toast.error(result.error || "Failed to create event");
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="mb-6 hover:bg-primary/10 hover:text-primary transition-colors gap-2"
            >
                <ArrowLeft className="h-4 w-4" /> Back
            </Button>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-[2rem] overflow-hidden shadow-xl">
                <CardHeader className="bg-gradient-to-br from-primary/10 to-transparent p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                            <Plus className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-primary">ADMIN CONSOLE</span>
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tight text-white mb-2">Create New Event</CardTitle>
                    <CardDescription className="text-muted-foreground text-lg">
                        Schedule an event that will be visible to all members on the dashboard.
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-8 space-y-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" /> Event Title
                            </label>
                            <Input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. ACM Tech Talk: AI in 2024"
                                className="h-12 rounded-xl border-border/50 bg-muted/20 text-base focus-visible:ring-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" /> Description
                            </label>
                            <Textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="What is this event about? Who should attend?"
                                rows={4}
                                className="rounded-xl border-border/50 bg-muted/20 text-base focus-visible:ring-primary"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" /> Date
                                </label>
                                <Input
                                    name="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="h-12 rounded-xl border-border/50 bg-muted/20 focus-visible:ring-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" /> Time
                                </label>
                                <Input
                                    name="time"
                                    type="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    className="h-12 rounded-xl border-border/50 bg-muted/20 focus-visible:ring-primary"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" /> Location
                            </label>
                            <Input
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g. Auditorium A or Hybrid Link"
                                className="h-12 rounded-xl border-border/50 bg-muted/20 text-base focus-visible:ring-primary"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black tracking-widest transition-all shadow-lg active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" /> INITIALIZING...
                                </div>
                            ) : (
                                "PUBLISH EVENT"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

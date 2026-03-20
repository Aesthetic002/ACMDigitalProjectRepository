import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import EventForm from "@/features/events/components/EventForm";
import { Calendar, Loader2 } from "lucide-react";
import { eventService } from "@/services/eventService";

export default function CreateEventPage() {
    const { id } = useParams();
    const isEditing = !!id;

    const { data: eventData, isLoading } = useQuery({
        queryKey: ["event", id],
        queryFn: async () => {
            const result = await eventService.getEvent(id);
            if (result.success) return result.event;
            throw new Error(result.error || "Event not found");
        },
        enabled: isEditing,
        retry: 1
    });

    return (
        <div className="space-y-12">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-acm-blue flex items-center justify-center shadow-lg shadow-acm-blue/20">
                    <Calendar className="text-white h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tight uppercase italic">Event Management</h1>
                    <p className="text-muted-foreground">Schedule and coordinate upcoming community gatherings.</p>
                </div>
            </div>

            {isEditing && isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
            ) : (
                <EventForm initialData={eventData} eventId={id} />
            )}
        </div>
    );
}

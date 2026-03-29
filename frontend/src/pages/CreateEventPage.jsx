import EventForm from "@/features/events/components/EventForm";
import { Calendar } from "lucide-react";

export default function CreateEventPage() {
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

            <EventForm />
        </div>
    );
}

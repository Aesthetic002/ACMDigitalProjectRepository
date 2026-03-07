import Layout from "@/components/Layout";
import EventForm from "@/features/events/components/EventForm";

export default function CreateEventPage() {
    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <EventForm />
            </div>
        </Layout>
    );
}

import { eventsAPI } from "./api";
import { fsEvents } from "./firebaseService";
import { useAuthStore } from "@/store/authStore";

export const eventService = {
    /**
     * Create a new event via backend API with Firestore fallback
     */
    async createEvent(eventData) {
        if (useAuthStore.getState().user?.isDemoUser) {
            // Fake success for demo
            return { success: true, id: 'demo-' + Date.now() };
        }
        
        try {
            const res = await eventsAPI.create(eventData);
            return { success: true, id: res.data.event.id };
        } catch (error) {
            console.warn("Backend add failed, falling back to Firestore: ", error);
            try {
                const id = await fsEvents.create(eventData);
                return { success: true, id };
            } catch (fsError) {
                console.error("Firestore add failed: ", fsError);
                return { success: false, error: fsError.message };
            }
        }
    },

    /**
     * Get all events via backend API with Firestore fallback
     */
    async getEvents() {
        try {
            const res = await eventsAPI.getAll();
            return { success: true, events: res.data.events };
        } catch (error) {
            console.warn("Backend fetch failed, falling back to Firestore: ", error);
            try {
                const events = await fsEvents.getAll();
                return { success: true, events };
            } catch (fsError) {
                console.error("Firestore fetch failed: ", fsError);
                return { success: false, error: fsError.message };
            }
        }
    },

    /**
     * Delete an event via backend API with Firestore fallback
     */
    async deleteEvent(eventId) {
        if (useAuthStore.getState().user?.isDemoUser) {
            return { success: true };
        }

        try {
            await eventsAPI.delete(eventId);
            return { success: true };
        } catch (error) {
            console.warn("Backend delete failed, falling back to Firestore: ", error);
            try {
                await fsEvents.delete(eventId);
                return { success: true };
            } catch (fsError) {
                console.error("Firestore delete failed: ", fsError);
                return { success: false, error: fsError.message };
            }
        }
    },

    /**
     * Get a single event by ID via backend API with Firestore fallback
     */
    async getEvent(eventId) {
        if (useAuthStore.getState().user?.isDemoUser && String(eventId).startsWith('de')) {
            // It's a hardcoded demo event, just return dummy
            return { 
                success: true, 
                event: { 
                    id: eventId, 
                    title: 'Demo Event', 
                    description: 'Demo Description', 
                    date: '2026-08-15', 
                    time: '12:00 PM', 
                    location: 'TBD' 
                } 
            };
        }

        try {
            const res = await eventsAPI.getById(eventId);
            return { success: true, event: res.data.event };
        } catch (error) {
            console.warn("Backend fetch failed, falling back to Firestore: ", error);
            try {
                const event = await fsEvents.getById(eventId);
                if (event) return { success: true, event };
                return { success: false, error: "Event not found" };
            } catch (fsError) {
                console.error("Firestore fetch failed: ", fsError);
                return { success: false, error: fsError.message };
            }
        }
    },

    /**
     * Update an event via backend API with Firestore fallback
     */
    async updateEvent(eventId, eventData) {
        if (useAuthStore.getState().user?.isDemoUser) {
            return { success: true };
        }

        try {
            await eventsAPI.update(eventId, eventData);
            return { success: true };
        } catch (error) {
            console.warn("Backend update failed, falling back to Firestore: ", error);
            try {
                await fsEvents.update(eventId, eventData);
                return { success: true };
            } catch (fsError) {
                console.error("Firestore update failed: ", fsError);
                return { success: false, error: fsError.message };
            }
        }
    }
};

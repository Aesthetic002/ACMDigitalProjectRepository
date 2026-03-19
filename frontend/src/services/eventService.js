import { eventsAPI } from "./api";

export const eventService = {
    /**
     * Create a new event via backend API
     */
    async createEvent(eventData) {
        try {
            const res = await eventsAPI.create(eventData);
            return { success: true, id: res.data.event.id };
        } catch (error) {
            console.error("Error adding event: ", error);
            return { success: false, error: error.response?.data?.message || error.message };
        }
    },

    /**
     * Get all events via backend API
     */
    async getEvents() {
        try {
            const res = await eventsAPI.getAll();
            return { success: true, events: res.data.events };
        } catch (error) {
            console.error("Error getting events: ", error);
            return { success: false, error: error.response?.data?.message || error.message };
        }
    },

    /**
     * Delete an event via backend API
     */
    async deleteEvent(eventId) {
        try {
            await eventsAPI.delete(eventId);
            return { success: true };
        } catch (error) {
            console.error("Error deleting event: ", error);
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }
};

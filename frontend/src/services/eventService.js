/**
 * Event Service - Mock Data Mode
 *
 * This version uses local mock data instead of backend API calls.
 */

import { eventsAPI } from "./api";

export const eventService = {
    /**
     * Create a new event
     */
    async createEvent(eventData) {
        try {
            const res = await eventsAPI.create(eventData);
            return { success: true, id: res.data.event.id };
        } catch (error) {
            console.error("Error adding event: ", error);
            return { success: false, error: error.message || "Failed to create event" };
        }
    },

    /**
     * Get all events
     */
    async getEvents() {
        try {
            const res = await eventsAPI.getAll();
            return { success: true, events: res.data.events || [] };
        } catch (error) {
            console.error("Error getting events: ", error);
            return { success: false, error: error.message || "Failed to get events", events: [] };
        }
    },

    /**
     * Get single event by ID
     */
    async getEventById(eventId) {
        try {
            const res = await eventsAPI.getById(eventId);
            return { success: true, event: res.data.event };
        } catch (error) {
            console.error("Error getting event: ", error);
            return { success: false, error: error.message || "Failed to get event" };
        }
    },

    /**
     * Update an event
     */
    async updateEvent(eventId, eventData) {
        try {
            const res = await eventsAPI.update(eventId, eventData);
            return { success: true, event: res.data.event };
        } catch (error) {
            console.error("Error updating event: ", error);
            return { success: false, error: error.message || "Failed to update event" };
        }
    },

    /**
     * Delete an event
     */
    async deleteEvent(eventId) {
        try {
            await eventsAPI.delete(eventId);
            return { success: true };
        } catch (error) {
            console.error("Error deleting event: ", error);
            return { success: false, error: error.message || "Failed to delete event" };
        }
    }
};

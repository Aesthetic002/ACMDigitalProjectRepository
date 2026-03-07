import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    deleteDoc,
    doc,
    timestamp
} from "firebase/firestore";
import { db } from "../config/firebase";

const COLLECTION_NAME = "events";

export const eventService = {
    /**
     * Create a new event in Firestore
     */
    async createEvent(eventData) {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...eventData,
                createdAt: new Date().toISOString(),
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error("Error adding event: ", error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get all events from Firestore, ordered by date
     */
    async getEvents() {
        try {
            const q = query(collection(db, COLLECTION_NAME), orderBy("date", "asc"));
            const querySnapshot = await getDocs(q);
            const events = [];
            querySnapshot.forEach((doc) => {
                events.push({ id: doc.id, ...doc.data() });
            });
            return { success: true, events };
        } catch (error) {
            console.error("Error getting events: ", error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Delete an event from Firestore
     */
    async deleteEvent(eventId) {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, eventId));
            return { success: true };
        } catch (error) {
            console.error("Error deleting event: ", error);
            return { success: false, error: error.message };
        }
    }
};

/**
 * Event Management Routes
 * 
 * Handles event-related endpoints:
 * - GET /api/v1/events - Get all events
 * - GET /api/v1/events/:id - Get a specific event
 * - POST /api/v1/events - Create an event (Admin only)
 * - PUT /api/v1/events/:id - Update an event (Admin only)
 * - DELETE /api/v1/events/:id - Delete an event (Admin only)
 */

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { db } = require('../firebase');

/**
 * GET /api/v1/events
 * 
 * Retrieves all events, ordered by date.
 */
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('events').orderBy('date', 'asc').get();

        const events = [];
        snapshot.forEach(doc => {
            events.push({ id: doc.id, ...doc.data() });
        });

        return res.status(200).json({
            success: true,
            events,
            count: events.length
        });
    } catch (error) {
        console.error('Get events error:', error.message);
        return res.status(500).json({
            success: false,
            error: 'InternalServerError',
            message: 'Failed to retrieve events'
        });
    }
});

/**
 * GET /api/v1/events/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const eventDoc = await db.collection('events').doc(id).get();

        if (!eventDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'NotFound',
                message: 'Event not found'
            });
        }

        return res.status(200).json({
            success: true,
            event: { id: eventDoc.id, ...eventDoc.data() }
        });
    } catch (error) {
        console.error('Get event error:', error.message);
        return res.status(500).json({
            success: false,
            error: 'InternalServerError',
            message: 'Failed to retrieve event'
        });
    }
});

/**
 * POST /api/v1/events
 * 
 * Admin only.
 */
router.post('/', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { title, description, date, time, location } = req.body;

        // Validation
        if (!title || !description || !date || !time || !location) {
            return res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'All fields are required'
            });
        }

        const eventData = {
            title,
            description,
            date,
            time,
            location,
            createdAt: new Date().toISOString(),
            createdBy: req.user.uid
        };

        const docRef = await db.collection('events').add(eventData);

        return res.status(201).json({
            success: true,
            message: 'Event created successfully',
            event: { id: docRef.id, ...eventData }
        });
    } catch (error) {
        console.error('Create event error:', error.message);
        return res.status(500).json({
            success: false,
            error: 'InternalServerError',
            message: 'Failed to create event'
        });
    }
});

/**
 * PUT /api/v1/events/:id
 * 
 * Admin only.
 */
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const eventRef = db.collection('events').doc(id);
        const eventDoc = await eventRef.get();

        if (!eventDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'NotFound',
                message: 'Event not found'
            });
        }

        // Protection against modifying certain fields
        delete updateData.id;
        delete updateData.createdAt;

        updateData.updatedAt = new Date().toISOString();
        updateData.updatedBy = req.user.uid;

        await eventRef.update(updateData);

        const updatedDoc = await eventRef.get();

        return res.status(200).json({
            success: true,
            message: 'Event updated successfully',
            event: { id, ...updatedDoc.data() }
        });
    } catch (error) {
        console.error('Update event error:', error.message);
        return res.status(500).json({
            success: false,
            error: 'InternalServerError',
            message: 'Failed to update event'
        });
    }
});

/**
 * DELETE /api/v1/events/:id
 * 
 * Admin only.
 */
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const eventRef = db.collection('events').doc(id);
        const eventDoc = await eventRef.get();

        if (!eventDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'NotFound',
                message: 'Event not found'
            });
        }

        await eventRef.delete();

        return res.status(200).json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('Delete event error:', error.message);
        return res.status(500).json({
            success: false,
            error: 'InternalServerError',
            message: 'Failed to delete event'
        });
    }
});

module.exports = router;

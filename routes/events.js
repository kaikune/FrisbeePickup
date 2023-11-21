// Import the express router as shown in the lecture code
// Note: please do not forget to export the router!
import { Router } from 'express';
import { eventsData } from '../data/index.js';
import * as helpers from '../helpers.js';

const router = Router();

router
    .route('/')
    .get(async (req, res) => {
        let allEvents = await eventsData.getAll();
        allEvents.map((event) => {
            event._id, event.eventName;
        });
        res.json(allEvents);
    })
    .post(async (req, res) => {
        const event = req.body;
        try {
            helpers.validateEvent(
                event.eventName,
                event.description,
                event.eventLocation,
                event.contactEmail,
                event.maxCapacity,
                event.priceOfAdmission,
                event.eventDate,
                event.startTime,
                event.endTime,
                event.publicEvent
            );

            const newEvent = await eventsData.create(
                event.eventName,
                event.description,
                event.eventLocation,
                event.contactEmail,
                event.maxCapacity,
                event.priceOfAdmission,
                event.eventDate,
                event.startTime,
                event.endTime,
                event.publicEvent
            );

            res.status(200).json(newEvent);
            return;
        } catch (err) {
            res.status(400).send(err);
            return;
        }
    });

router
    .route('/:eventId')
    .get(async (req, res) => {
        const eventId = req.params.eventId;

        // Validate event id
        try {
            helpers.isValidId(eventId);
        } catch (err) {
            res.status(400).send(err);
            return;
        }

        // Find event
        try {
            const event = await eventsData.get(eventId);
            res.status(200).json(event);
        } catch (err) {
            res.status(404).send(err);
        }
    })
    .delete(async (req, res) => {
        const eventId = req.params.eventId;

        // Validate event id
        try {
            helpers.isValidId(eventId);
        } catch (err) {
            res.status(400).send(err);
            return;
        }

        // delete event
        try {
            const event = await eventsData.remove(eventId);
            res.status(200).json(event);
            return;
        } catch (err) {
            res.status(404).send(err);
        }
    })
    .put(async (req, res) => {
        const eventId = req.params.eventId;
        const updatedEvent = req.body;

        // Validate event id
        try {
            helpers.isValidId(eventId);
            helpers.validateEvent(
                updatedEvent.eventName,
                updatedEvent.description,
                updatedEvent.eventLocation,
                updatedEvent.contactEmail,
                updatedEvent.maxCapacity,
                updatedEvent.priceOfAdmission,
                updatedEvent.eventDate,
                updatedEvent.startTime,
                updatedEvent.endTime,
                updatedEvent.publicEvent
            );
        } catch (err) {
            res.status(400).send(err);
            return;
        }

        try {
            await eventsData.get(eventId);
        } catch (err) {
            res.status(404).send(err);
            return;
        }

        // update event
        try {
            const event = await eventsData.update(
                eventId,
                updatedEvent.eventName,
                updatedEvent.description,
                updatedEvent.eventLocation,
                updatedEvent.contactEmail,
                updatedEvent.maxCapacity,
                updatedEvent.priceOfAdmission,
                updatedEvent.eventDate,
                updatedEvent.startTime,
                updatedEvent.endTime,
                updatedEvent.publicEvent
            );
            res.status(200).json(event);
            return;
        } catch (err) {
            res.status(400).send(err);
            return;
        }
    });

export default router;

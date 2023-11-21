// Import the express router as shown in the lecture code
// Note: please do not forget to export the router!
import { Router } from 'express';
import * as helpers from '../helpers.js';
import { attendeesData } from '../data/index.js';

const router = Router();

router
    .route('/:eventId')
    .get(async (req, res) => {
        const eventId = req.params.eventId;

        // Validate id
        try {
            helpers.isValidId(eventId);
        } catch (err) {
            res.status(400).send(err);
            return;
        }

        try {
            const allAttendees = await attendeesData.getAllAttendees(eventId);

            res.status(200).json(allAttendees);
        } catch (err) {
            res.status(404).send(err);
            return;
        }
    })
    .post(async (req, res) => {
        const eventId = req.params.eventId;
        const attendee = req.body;

        // Validate Input
        try {
            helpers.isValidId(eventId);
            helpers.validateAttendee(attendee.firstName, attendee.lastName, attendee.emailAddress);
        } catch (err) {
            res.status(400).send(err);
            return;
        }

        // Add new attendee to event
        try {
            const updatedEvent = await attendeesData.createAttendee(eventId, attendee.firstName, attendee.lastName, attendee.emailAddress);
            res.status(200).json(updatedEvent);
            return;
        } catch (err) {
            if (err === 'Email already in use for this event' || err === 'Event is currently full') {
                res.status(400).send(err);
                return;
            }
            res.status(404).send(err);
            return;
        }
    });

router
    .route('/attendee/:attendeeId')
    .get(async (req, res) => {
        const attendeeId = req.params.attendeeId;

        // Validate id
        try {
            helpers.isValidId(attendeeId);
        } catch (err) {
            res.status(400).send(err);
            return;
        }

        // Get attendee
        try {
            const attendee = await attendeesData.getAttendee(attendeeId);
            res.status(200).json(attendee);
            return;
        } catch (err) {
            res.status(404).send(err);
            return;
        }
    })
    .delete(async (req, res) => {
        const attendeeId = req.params.attendeeId;

        // Validate id
        try {
            helpers.isValidId(attendeeId);
        } catch (err) {
            res.status(400).send(err);
            return;
        }

        try {
            const updatedEvent = await attendeesData.removeAttendee(attendeeId);
            res.status(200).json(updatedEvent);
            return;
        } catch (err) {
            res.status(404).send(err);
            return;
        }
    });

export default router;

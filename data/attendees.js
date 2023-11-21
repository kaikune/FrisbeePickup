// This data file should export all functions using the ES6 standard as shown in the lecture code

import * as helpers from '../helpers.js';
import { events } from '../config/mongoCollections.js';
import eventsFunctions from './events.js';
import { ObjectId } from 'mongodb';

const createAttendee = async (eventId, firstName, lastName, emailAddress) => {
    // Input Validation
    helpers.isValidId(eventId);
    helpers.validateAttendee(firstName, lastName, emailAddress);

    eventId = eventId.trim();
    firstName = firstName.trim();
    lastName = lastName.trim();
    emailAddress = emailAddress.trim();

    // Search for event
    const eventCollection = await events();
    const event = await eventsFunctions.get(eventId);
    if (event.totalNumberOfAttendees === event.maxCapacity) throw 'Event is currently full';

    // Check for existing email
    //if (event.attendees.includes({ emailAddress: emailAddress })) throw 'Email already in use for this event';
    if (event.attendees.filter((attendee) => attendee.emailAddress === emailAddress).length > 0) throw 'Email already in use for this event';

    // Create attendee
    const attendee = {
        _id: new ObjectId(),
        firstName,
        lastName,
        emailAddress,
    };

    // Update the event
    const updatedEvent = await eventCollection.findOneAndUpdate(
        { _id: new ObjectId(eventId) },
        {
            $push: { attendees: attendee },
            $inc: { totalNumberOfAttendees: 1 },
        },
        { returnDocument: 'after' }
    );

    if (!updatedEvent) throw "Couldn't update the event";
    updatedEvent._id = updatedEvent._id.toString();
    return updatedEvent;
};

const getAllAttendees = async (eventId) => {
    // Get all attendees
    const event = await eventsFunctions.get(eventId);
    return event.attendees;
};

const getAttendee = async (attendeeId) => {
    // Input Validation
    if (!attendeeId) throw 'Attendee Id not given';
    if (typeof attendeeId !== 'string') throw 'Attendee Id is not a string';
    attendeeId = attendeeId.trim();
    if (!ObjectId.isValid(attendeeId)) throw 'Attendee Id is not valid';

    // Get all events
    const events = await eventsFunctions.getAll();

    // Look for attendee
    for (const event of events) {
        const attendees = await getAllAttendees(event._id);
        for (const attendee of attendees) {
            if (attendee._id.toString() === attendeeId) {
                return attendee;
            }
        }
    }

    //    const eventCollection = await events();
    // const attendee = await eventCollection.findOne(
    //     { 'attendees._id': new ObjectId(attendeeId) },
    //     { projection: { attendees: { _id: 1 } } }
    // );
    //return attendee;

    // Cannot find attendee
    throw 'Could not find attendee';
};

const removeAttendee = async (attendeeId) => {
    // Input Validation
    if (!attendeeId) throw 'Attendee Id not given';
    if (typeof attendeeId !== 'string') throw 'Attendee Id is not a string';
    attendeeId = attendeeId.trim();
    if (!ObjectId.isValid(attendeeId)) throw 'Attendee Id is not valid';

    const eventCollection = await events();

    const remove = await eventCollection.findOneAndUpdate(
        { 'attendees._id': new ObjectId(attendeeId) },
        {
            $pull: {
                attendees: {
                    _id: new ObjectId(attendeeId), // remove attendee
                },
            },
            $inc: { totalNumberOfAttendees: -1 },
        },
        { returnDocument: 'after' }
    );

    if (!remove) throw 'Could not remove attendee';
    return remove;
};

export default { createAttendee, getAllAttendees, getAttendee, removeAttendee };

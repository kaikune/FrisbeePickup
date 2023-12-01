// This data file should export all functions using the ES6 standard as shown in the lecture code

import * as helpers from '../helpers.js';
//import { events } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';

const create = async (
    eventName,
    eventDescription,
    eventLocation,
    contactEmail,
    maxCapacity,
    priceOfAdmission,
    eventDate,
    startTime,
    endTime,
    publicEvent
) => {
    // Input Validation
    helpers.validateEvent(
        eventName,
        eventDescription,
        eventLocation,
        contactEmail,
        maxCapacity,
        priceOfAdmission,
        eventDate,
        startTime,
        endTime,
        publicEvent
    );

    eventName = eventName.trim();
    eventDescription = eventDescription.trim();
    contactEmail = contactEmail.trim().toLowerCase();
    eventDate = eventDate.trim();
    startTime = startTime.trim();
    endTime = endTime.trim();

    // Add event to database
    let newEvent = {
        eventName,
        description: eventDescription,
        eventLocation,
        contactEmail,
        maxCapacity,
        priceOfAdmission,
        eventDate,
        startTime,
        endTime,
        publicEvent,
        attendees: [],
        totalNumberOfAttendees: 0,
    };

    const eventCollection = await events();
    const insertInfo = await eventCollection.insertOne(newEvent);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Could not add event';

    const newId = insertInfo.insertedId.toString();

    const event = await eventCollection.findOne({ _id: new ObjectId(newId) });
    event._id = event._id.toString();
    //await closeConnection(); // For testing purposes
    return event;
};

const getAll = async () => {
    const eventCollection = await events();
    let eventList = await eventCollection.find({}).project({ _id: 1, eventName: 1 }).toArray();
    if (!eventList) throw 'Could not get all events';
    eventList = eventList.map((element) => {
        element._id = element._id.toString();
        return element;
    });
    return eventList;
};


const get = async (eventId) => {
    // Input Validation
    helpers.isValidId(eventId);
    eventId = eventId.trim();

    // Get event with given id
    const eventCollection = await events();
    const event = await eventCollection.findOne({ _id: new ObjectId(eventId) });
    if (event === null) throw 'No event with that id';
    event._id = event._id.toString();
    return event;
};

const remove = async (eventId) => {
    // Input Validation
    helpers.isValidId(eventId);
    eventId = eventId.trim();

    // Delete event with given id
    const eventCollection = await events();
    const deletionInfo = await eventCollection.findOneAndDelete(
        {
            _id: new ObjectId(eventId),
        },
        { returnDocument: 'after' }
    );
    if (!deletionInfo) {
        throw `Could not delete event with id of ${eventId}`;
    }

    const res = { eventName: deletionInfo.eventName, deleted: true };
    return res;
};

const update = async (
    eventId,
    eventName,
    eventDescription,
    eventLocation,
    contactEmail,
    maxCapacity,
    priceOfAdmission,
    eventDate,
    startTime,
    endTime,
    publicEvent
) => {
    // Input Validation
    helpers.isValidId(eventId);
    eventId = eventId.trim();

    helpers.validateEvent(
        eventName,
        eventDescription,
        eventLocation,
        contactEmail,
        maxCapacity,
        priceOfAdmission,
        eventDate,
        startTime,
        endTime,
        publicEvent
    );

    eventName = eventName.trim();
    eventDescription = eventDescription.trim();
    contactEmail = contactEmail.trim().toLowerCase();
    eventDate = eventDate.trim();
    startTime = startTime.trim();
    endTime = endTime.trim();

    const oldEvent = await get(eventId); // Check if event exists

    // Update record
    const updatedEvent = {
        eventName,
        description: eventDescription,
        eventLocation,
        contactEmail,
        maxCapacity,
        priceOfAdmission,
        eventDate,
        startTime,
        endTime,
        publicEvent,
        attendees: oldEvent.attendees,
        totalNumberOfAttendees: oldEvent.totalNumberOfAttendees,
    };

    const eventCollection = await events();
    const updatedInfo = await eventCollection.findOneAndReplace({ _id: new ObjectId(eventId) }, updatedEvent, { returnDocument: 'after' });
    if (!updatedInfo) {
        throw 'could not update event successfully';
    }
    updatedInfo._id = updatedInfo._id.toString();
    return updatedInfo;
};

export default { create, getAll, get, remove, update };

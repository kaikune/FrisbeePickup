// You can add and export any helper functions you want here - if you aren't using any, then you can just leave this file as is

import { ObjectId } from 'mongodb';

export function validateAttendee(firstName, lastName, emailAddress) {
    if (!firstName || !lastName || !emailAddress) throw 'All fields need to have valid values';
    if (typeof firstName !== 'string' || typeof lastName !== 'string' || typeof emailAddress !== 'string') throw 'All fields need to be strings';
    firstName = firstName.trim().toLowerCase();
    lastName = lastName.trim().toLowerCase();
    emailAddress = emailAddress.trim().toLowerCase();
    if (firstName.length === 0 || lastName.length === 0 || emailAddress.length === 0) throw '1 or more fields is an empty string';
    if (!isValidEmail(emailAddress)) throw 'Attendee email is not a valid format';
    if (!isValidName(firstName) || !isValidName(lastName)) throw 'Attendee name is not valid';
}

export function validateEvent(
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
) {
    // Input Validation
    if (
        eventName == null ||
        eventDescription == null ||
        eventLocation == null ||
        contactEmail == null ||
        maxCapacity == null ||
        priceOfAdmission == null ||
        eventDate == null ||
        startTime == null ||
        endTime == null ||
        publicEvent == null
    )
        throw 'All fields need to have valid values';

    if (
        typeof eventName !== 'string' ||
        typeof eventDescription !== 'string' ||
        typeof contactEmail !== 'string' ||
        typeof eventDate !== 'string' ||
        typeof startTime !== 'string' ||
        typeof endTime !== 'string'
    )
        throw 'One or more string fields not given as string';

    eventName = eventName.trim();
    eventDescription = eventDescription.trim();
    contactEmail = contactEmail.trim().toLowerCase();
    eventDate = eventDate.trim();
    startTime = startTime.trim();
    endTime = endTime.trim();

    if (
        eventName.length === 0 ||
        eventDescription.length === 0 ||
        contactEmail.length === 0 ||
        eventDate.length === 0 ||
        startTime.length === 0 ||
        endTime.length === 0
    )
        throw 'One or more string fields empty';

    if (eventName.length < 5) throw 'Event name less than 5 chars';
    if (eventDescription.length < 25) throw 'Event description less than 25 chars';
    if (!isValidEmail(contactEmail)) throw 'Contact email is not a valid format';
    if (!isValidDay(eventDate)) throw 'Event Date is not valid';
    const date = new Date();
    const currentDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    if (compareDates(currentDate, eventDate) === 1) throw 'Event Date has to be in the future';
    if (!isValidTime(startTime) || !isValidTime(endTime)) throw 'Start and/or end time is not valid';
    if (!compareTimes(startTime, endTime)) throw 'Start time has to be 30min before end time';

    if (typeof publicEvent !== 'boolean') throw 'Public event is not a boolean';
    if (typeof maxCapacity !== 'number' || typeof priceOfAdmission !== 'number') throw 'Max cap. and/or price not a number';
    if (priceOfAdmission < 0) throw 'Price should be >= 0';
    if (priceOfAdmission.toString().split('.')[1] && priceOfAdmission.toString().split('.')[1].length !== 2)
        throw 'Price not a whole number or not 2 decimal places';
    if (maxCapacity <= 0) throw 'Max cap. should be > 0';
    if (maxCapacity.toString().split('.')[1]) throw 'Max cap. not a whole number';
    if (typeof eventLocation !== 'object') throw 'Event location is not an object';
    if (!eventLocation.streetAddress || !eventLocation.city || !eventLocation.state || !eventLocation.zip) throw 'Event location missing key(s)';
    if (
        typeof eventLocation.streetAddress !== 'string' ||
        typeof eventLocation.city !== 'string' ||
        typeof eventLocation.state !== 'string' ||
        typeof eventLocation.zip !== 'string'
    )
        throw 'Event location values not string';
    for (const key in eventLocation) eventLocation[key] = eventLocation[key].trim();
    if (eventLocation.streetAddress.length < 3) throw "Event location's street address too short";
    if (eventLocation.city.length < 3) throw "Event location's city name too short";
    eventLocation.state = eventLocation.state.toUpperCase();
    if (!states.includes(eventLocation.state)) throw 'State is not valid';
    if (eventLocation.zip.length !== 5 || isNaN(eventLocation.zip)) throw 'Zip code is not valid';
}

export function isValidId(id) {
    if (!id) throw 'No id given';
    if (typeof id !== 'string') throw 'Id is not a string';
    if (!ObjectId.isValid(id.trim())) throw 'Id is not valid';
}

export function isValidName(name) {
    return /^[a-z' -]+$/.test(name);
}

export function isValidEmail(contactEmail) {
    return /^([a-z0-9]+|([a-z0-9]+[.-_]*[a-z0-9]))+@[a-z0-9-]+\.[a-z]{2,}$/.test(contactEmail);
}

// Checks for valid number of days in given month
export function isValidDay(eventDate) {
    if (!/^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/.test(eventDate)) return 0;
    const date = eventDate.split('/');
    const month = Number(date[0]);
    const day = Number(date[1]);

    // Checks if number of days is valid for the month
    switch (month) {
        case 1:
            return day <= 31;
        case 2:
            return day <= 28;
        case 3:
            return day <= 31;
        case 4:
            return day <= 30;
        case 5:
            return day <= 31;
        case 6:
            return day <= 30;
        case 7:
            return day <= 31;
        case 8:
            return day <= 31;
        case 9:
            return day <= 30;
        case 10:
            return day <= 31;
        case 11:
            return day <= 30;
        case 12:
            return day <= 31;
        default:
            return false;
    }
}

export function compareDates(day1, day2) {
    if (!day1 || !day2) throw 'Error: Missing argument(s) to compareDay()';
    if (typeof day1 !== 'string' || typeof day2 !== 'string') throw 'Error: Argument(s) sent to compareDay not a string';

    // Get number array of [month, day, year]
    day1 = day1.split('/').map((day) => Number(day));
    day2 = day2.split('/').map((day) => Number(day));

    // Compare years
    if (day1[2] > day2[2]) return 1;
    if (day1[2] === day2[2]) {
        // Compare months
        if (day1[0] > day2[0]) return 1;
        if (day1[0] === day2[0]) {
            // Compare days
            if (day1[1] >= day2[1]) return 1;
        }
    }
    // day1 is less than day2
    return -1;
}

export function isValidTime(time) {
    return /^(([1-9])|(1[0-2])):[0-5][0-9] (AM|PM)$/.test(time);
    //return /^((0{0,1}[1-9])|(1[0-2])):[0-5][0-9](AM|PM)$/.test(time);
}

// Returns time1 >= time2 - 30
export function compareTimes(time1, time2) {
    time1 = time1.split(':'); // Splits into [HR, MN(AM|PM)]
    time1.push(time1[1].substr(-2, 2)); // [HR, MN(AM|PM), (AM|PM)]
    time1[1] = time1[1].substr(0, 2); // [HR, MN, (AM|PM)]
    time1[0] = Number(time1[0]) * 60 + Number(time1[1]); // [Minutes, __, (AM|PM)]

    time2 = time2.split(':');
    time2.push(time2[1].substr(-2, 2));
    time2[1] = time2[1].substr(0, 2);
    time2[0] = Number(time2[0]) * 60 + Number(time2[1]);

    if (time1[2] === time2[2]) {
        return time1[0] + 30 <= time2[0];
    }
    return time1[2] === 'PM' ? false : true; // Compares AM PM
}

export const states = [
    'AK',
    'AL',
    'AR',
    'AZ',
    'CA',
    'CO',
    'CT',
    'DC',
    'DE',
    'FL',
    'GA',
    'HI',
    'IA',
    'ID',
    'IL',
    'IN',
    'KS',
    'KY',
    'LA',
    'MA',
    'MD',
    'ME',
    'MI',
    'MN',
    'MO',
    'MS',
    'MT',
    'NC',
    'ND',
    'NE',
    'NH',
    'NJ',
    'NM',
    'NV',
    'NY',
    'OH',
    'OK',
    'OR',
    'PA',
    'RI',
    'SC',
    'SD',
    'TN',
    'TX',
    'UT',
    'VA',
    'VT',
    'WA',
    'WI',
    'WV',
    'WY',
];

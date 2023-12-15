// You can add and export any helper functions you want here - if you aren't using any, then you can just leave this file as is

import { ObjectId } from 'mongodb';

let stringHelper = function (string, stringName, minLength, maxLength) {
    if (string == null) {
        throw stringName + ' was not provided!';
    }
    if (typeof string != 'string') {
        throw stringName + ' must be a string!';
    }
    string = string.trim();
    if (minLength != null && string.length < minLength) {
        throw 'The provided ' + stringName + " isn't long enough!";
    }
    if (maxLength != null && string.length > maxLength) {
        throw 'The provided ' + stringName + ' is too long!';
    }
    return string;
};

export function validateUser(username, emailAddress, password) {
    username = stringHelper(username, 'Username', 3, 10);
    username = username.toLowerCase();
    emailAddress = stringHelper(emailAddress, 'Email address', 1, null);
    emailAddress = emailAddress.toLowerCase();
    password = stringHelper(password, 'Password', 1, null);
    if (!isValidEmail(emailAddress)) {
        throw 'User email is invalid!';
    }
    validatePassword(password);
}

export function validateUserBio(username, profilePicture, description) {
    if (!username || !profilePicture || !description) {
        throw 'All fields need to have valid values';
    }
    if (typeof username !== 'string' || typeof profilePicture !== 'string' || typeof description !== 'string') throw 'All fields need to be strings';
    username = username.trim().toLowerCase();
    profilePicture = profilePicture.trim().toLowerCase();
    description = description.trim().toLowerCase();
    if (username.length === 0 || profilePicture.length === 0 || description.length === 0) throw '1 or more fields is an empty string';
    if (username.length < 3 || username.length > 10) throw 'Username is not a valid length';
    if (description.length < 0 || description.length > 300) throw 'Description is not a valid length';
    //TODO figure out the description
}
export function validatePassword(password) {
    //Using
    if (password.length < 8) {
        throw 'Password must be at least 8 characters long.';
    }
    if (!/[A-Z]/.test(password)) {
        console.log(password);
        throw 'Password must contain at least one uppercase letter.';
    }
    if (!/[0-9]/.test(password)) {
        throw 'Password must contain at least one number.';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        throw 'Password must contain at least one special character.';
    }
}
export function validateGame(gameName, gameDescription, gameLocation, maxCapacity, gameDate, startTime, endTime, group) {
    // Input Validation
    if (
        gameName == null ||
        gameDescription == null ||
        gameLocation == null ||
        maxCapacity == null ||
        gameDate == null ||
        startTime == null ||
        endTime == null
    )
        throw 'All fields need to have valid values';

    if (
        typeof gameName !== 'string' ||
        typeof gameDescription !== 'string' ||
        typeof gameDate !== 'string' ||
        typeof startTime !== 'string' ||
        typeof endTime !== 'string'
    )
        throw 'One or more string fields not given as string';

    gameName = gameName.trim();
    gameDescription = gameDescription.trim();
    gameDate = gameDate.trim();
    startTime = startTime.trim();
    endTime = endTime.trim();

    if (gameName.length === 0 || gameDescription.length === 0 || gameDate.length === 0 || startTime.length === 0 || endTime.length === 0)
        throw 'One or more string fields empty';

    if (gameName.length < 5) throw 'Event name less than 5 chars';
    if (gameDescription.length < 25) throw 'Event description less than 25 chars';
    if (!isValidDay(gameDate)) throw 'Event Date is not valid';
    if (isDateInFuture(gameDate)) throw 'Event Date has to be in the future';
    if (!isValidTime(startTime) || !isValidTime(endTime)) throw 'Start and/or end time is not valid';
    if (!compareTimes(startTime, endTime)) throw 'Start time has to be 30min before end time';

    if (typeof maxCapacity !== 'number') throw 'Max cap. and/or price not a number';
    if (maxCapacity <= 0) throw 'Max cap. should be > 0';
    if (maxCapacity.toString().split('.')[1]) throw 'Max cap. not a whole number';
    if (typeof gameLocation !== 'object') throw 'Event location is not an object';
    if (!gameLocation.streetAddress || !gameLocation.city || !gameLocation.state || !gameLocation.zip) throw 'Event location missing key(s)';
    if (
        typeof gameLocation.streetAddress !== 'string' ||
        typeof gameLocation.city !== 'string' ||
        typeof gameLocation.state !== 'string' ||
        typeof gameLocation.zip !== 'string'
    )
        throw 'Event location values not string';
    for (const key in gameLocation) gameLocation[key] = gameLocation[key].trim();
    if (gameLocation.streetAddress.length < 3) throw "Event location's street address too short";
    if (gameLocation.city.length < 3) throw "Event location's city name too short";
    gameLocation.state = gameLocation.state.toUpperCase();
    if (!states.includes(gameLocation.state)) throw 'State is not valid';
    if (gameLocation.zip.length !== 5 || isNaN(gameLocation.zip)) throw 'Zip code is not valid';

    if (group) isValidId(group);
}

export function validateGroup(groupName, groupDescription, groupLeader) {
    // Input Validation
    if (groupName == null || groupDescription == null || groupLeader == null) throw 'All fields need to have valid values';

    if (typeof groupName !== 'string' || typeof groupDescription !== 'string') throw 'One or more string fields not given as string';

    groupName = groupName.trim();
    groupDescription = groupDescription.trim();

    if (groupName.length === 0 || groupDescription.length === 0) throw 'One or more string fields empty';

    if (groupName.length < 5) throw 'group name less than 5 chars';
    if (groupDescription.length < 25) throw 'group description less than 25 chars';
    isValidId(groupLeader);
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
    if (!day1 || !day2) throw 'Error: Missing argument(s) to compareDates()';
    if (typeof day1 !== 'string' || typeof day2 !== 'string') throw 'Error: Argument(s) sent to compareDates not a string';

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

export function isDateInFuture(gameDate) {
    let currentDate = new Date();
    currentDate = `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;

    return compareDates(currentDate, gameDate) === 1;
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

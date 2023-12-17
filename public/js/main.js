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
const states = [
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
function isValidEmail (contactEmail) {
    return /^([a-z0-9]+|([a-z0-9]+[.-_]*[a-z0-9]))+@[a-z0-9-]+\.[a-z]{2,}$/.test(contactEmail);
}
function validatePassword (password) {
    if (password.length < 8) {
        throw 'Password must be at least 8 characters long.';
    }
    if (!/[A-Z]/.test(password)) {
        throw 'Password must contain at least one uppercase letter.';
    }
    if (!/[0-9]/.test(password)) {
        throw 'Password must contain at least one number.';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        throw 'Password must contain at least one special character.';
    }
}
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
let charIsLowercase = function (c) {
    return c >= 'a' && c <= 'z';
};
let charIsNumber = function (c) {
    return c >= '0' && c <= '9';
};
let isValidEmail = function (email) {
    // Based on https://help.xmatters.com/ondemand/trial/valid_email_format.htm
    if (!email.includes('@')) return false;
    let s = email.split('@');
    if (s.length != 2) return false;
    let [prefix, domain] = s;
    if (!prefix.length || !domain.length) return false;

    for (let i = 0; i < prefix.length; i++) {
        if (charIsLowercase(prefix[i]) || charIsNumber(prefix[i])) {
            continue;
        } else if ('_.-'.includes(prefix[i])) {
            if (!i) return false;
            if (i == prefix.length - 1) return false;
            if ('_.-'.includes(prefix[i - 1])) return false;
            continue;
        } else {
            return false;
        }
    }

    let idx = -1;
    for (let i = domain.length - 1; i >= 0; i--) {
        if (domain[i] == '.') {
            idx = i;
            break;
        }
    }
    if (idx == -1 || idx == 0 || idx == domain.length - 1) return false;
    let tld = domain.substring(idx + 1);
    let site = domain.substring(0, idx - 1);
    for (let i = 0; i < site.length; i++) {
        if (!(charIsLowercase(site[i]) || charIsNumber(site[i]) || site[i] == '-')) {
            return false;
        }
    }
    if (tld.length < 2) return false;
    return true;
};
function validatePassword(password) {
    if (password.length < 8) {
        throw 'Password must be at least 8 characters long.';
    }
    if (!/[A-Z]/.test(password)) {
        throw 'Password must contain at least one uppercase letter.';
    }
    if (!/[0-9]/.test(password)) {
        throw 'Password must contain at least one number.';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/-.test(password)) {
        throw 'Password must contain at least one special character.';
    }
}

function confirmDelete(thing = '') {
    return confirm(`Are you sure you want to delete this ${thing}?`);
}

function confirmLeave(thing = '') {
    return confirm(`Are you sure you want to leave this ${thing}?`);
}

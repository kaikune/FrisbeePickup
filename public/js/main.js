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

//console.log(sessionStorage);
let createGroupForm = document.getElementById('create-group-form');

if (createGroupForm) {
    let errorLabel = document.getElementById('error-label');
    let messageLabel = document.getElementById('message-label');
    errorLabel.hidden = true;

    createGroupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        try {
            let groupName = document.getElementById('group-name');
            let groupDescription = document.getElementById('description');
            validateGroup(groupName.value, groupDescription.value);
            messageLabel.innerHTML = 'Group Created';
            messageLabel.hidden = false;
            createGroupForm.submit();
        } catch (err) {
            event.preventDefault();
            errorLabel.innerHTML = err;
            errorLabel.hidden = false;
        }
    });
}

function validateGroup(groupName, groupDescription) {
    // Input Validation
    if (groupName == null || groupDescription == null) throw 'All fields need to have valid values';

    if (typeof groupName !== 'string' || typeof groupDescription !== 'string') throw 'One or more string fields not given as string';

    groupName = groupName.trim();
    groupDescription = groupDescription.trim();

    if (groupName.length === 0 || groupDescription.length === 0) throw 'One or more string fields empty';

    if (groupName.length < 5) throw 'group name less than 5 chars';
    if (groupDescription.length == 0) throw 'group description is too short';
}

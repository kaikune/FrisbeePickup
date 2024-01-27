let loginForm = document.getElementById('login-form');
let submitButton = document.getElementById('login-submit-button');

if (loginForm) {
    let errorLabel = document.getElementById('error-label');
    errorLabel.hidden = true;
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        try {
            let emailAddress = stringHelper(document.getElementById('login-username').value, 'Username', 1, null).toLowerCase();
            let password = stringHelper(document.getElementById('login-password').value, 'Password', 1, null);

            // Submit form
            loginForm.submit();
            submitButton.disabled = true;
        } catch (err) {
            errorLabel.innerHTML = err;
            errorLabel.hidden = false;
        }
    });
}

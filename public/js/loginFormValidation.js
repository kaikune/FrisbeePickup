let loginForm = document.getElementById('login-form');

if (loginForm) {
    let errorLabel = document.getElementById('error-label');
    errorLabel.hidden = true;
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        try {
            let emailAddress = stringHelper(document.getElementById('login-username').value, 'Username', 1, null).toLowerCase();
            let password = stringHelper(document.getElementById('login-password').value, 'Password', 1, null);
            event.currentTarget.submit();
        } catch (err) {
            errorLabel.innerHTML = err;
            errorLabel.hidden = false;
        }
    });
}

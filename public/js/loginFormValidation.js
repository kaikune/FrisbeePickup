let loginForm = document.getElementById('login-form');

if (loginForm) {
    let errorLabel = document.getElementById('error-label');
    errorLabel.hidden = true;
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        try {
            let emailAddress = document.getElementById('login-emailAddress').value.toLowerCase();
            if (!isValidEmail(emailAddress)) {
                throw Error('Invalid email!');
            }
            event.currentTarget.submit();
        } catch (err) {
            errorLabel.innerHTML = err;
            errorLabel.hidden = false;
        }
    });
}

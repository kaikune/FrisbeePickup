let loginForm = document.getElementById("login-form");

if (loginForm) {
    let errorLabel = document.getElementById("error-label");
    errorLabel.hidden = true;
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        try {
            let emailAddress = document.getElementById("login-emailAddress").value.toLowerCase();
            let password = document.getElementById("login-password").value;
            if (!isValidEmail(emailAddress)) {
                throw Error("Invalid email!");
            }
            validatePassword(password);
            event.currentTarget.submit();
        }
        catch (err) {
            errorLabel.innerHTML = err;
            errorLabel.hidden = false;
        }
    });
}
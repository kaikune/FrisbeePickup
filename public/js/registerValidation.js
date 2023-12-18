let registerForm = document.getElementById("create-user-form");

if (registerForm) {
    let errorLabel = document.getElementById("error-label");
    errorLabel.hidden = true;
    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        try {

            let emailAddress = stringHelper(document.getElementById("emailAddress").value, "Email address", 1, null);
            let username = stringHelper(document.getElementById("username").value, "Username", 3, 10);
            let description = stringHelper(document.getElementById("description").value, "Description", null, 300);
            let password = stringHelper(document.getElementById("password").value, "Password", 1, null);
            let confirmPassword = stringHelper(document.getElementById("confirm-password").value, "Confirm password", 1, null);

            if (!isValidEmail(emailAddress)) {
                throw Error("Invalid email!");
            }
            validatePassword(password);
            if (password != confirmPassword) {
                throw Error("Passwords don't match!");
            }
            event.currentTarget.submit();
        }
        catch (err) {
            errorLabel.innerHTML = err;
            errorLabel.hidden = false;
        }
    });
}
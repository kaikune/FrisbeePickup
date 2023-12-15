import { isValidEmail, validatePassword } from "../../helpers";

let loginForm = document.getElementById("login-form")

if(loginForm){
    let errorLabel = document.getElementById("error-label")
    errorLabel.hidden = true;
    loginForm.addEventListener('submit', (event) => {
        try{
            let emailAddress = document.getElementById("login-emailAddress");
            let password = document.getElementById("password");
            isValidEmail(emailAddress);
            validatePassword(password)
        }
        catch(err){
            event.preventDefault();
            errorLabel.innerHTML = err;
            errorLabel.hidden = false;
        }
    })
}
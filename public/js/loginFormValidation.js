let loginForm = document.getElementById("login-form")

if(loginForm){
    let errorLabel = document.getElementById("error-label")
    errorLabel.hidden = true;
    loginForm.addEventListener('submit', (event) => {
        try{
        //Email Validation
        //Password Validation
        }
        catch(err){
            event.preventDefault();
            errorLabel.innerHTML = err;
            errorLabel.hidden = false;
        }
    })
}
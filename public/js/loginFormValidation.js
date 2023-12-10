let loginForm = document.getElementById("login-form")

if(loginForm){
    let errorLabel = document.getElementById("error-label")
    errorLabel.hidden = true;
    //LISTEN FOR FORM SUBMISSION
    event.preventDefault();
    try{
    //Email Validation
    //Password Validation
    }
    catch(err){
        errorLabel.innerHTML = err;
        errorLabel.hidden = false;
    }

}
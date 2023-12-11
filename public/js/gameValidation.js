let createGameForm = document.getElementById("create-game-form");

if(createGameForm){
    let errorLabel = document.getElementById("error-label")
    let statusLabel = document.getElementById("status-label")
    errorLabel.hidden = true;

    loginForm.addEventListener('submit', (event) => {
        try{
        //Email Validation
        //Password Validation
            statusLabel.innerHTML = "Game Created"
            statusLabel.hidden = false;
        }
        catch(err){
            event.preventDefault();
            errorLabel.innerHTML = err;
            errorLabel.hidden = false;
        }
    })
}
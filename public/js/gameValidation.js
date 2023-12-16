let createGameForm = document.getElementById("create-game-form");

if(createGameForm){
    let errorLabel = document.getElementById("error-label")
    let statusLabel = document.getElementById("status-label")
    errorLabel.hidden = true;

    createGameForm.addEventListener('submit', (event) => {
        try{
            let gameName = document.getElementById("game-name");
            let location = document.getElementById("location");
            let description = document.getElementById("description");
            let date = document.getElementById("date");
            let startTime = document.getElementById("start-time");
            let endTime = document.getElementById("end-time");
            let maxPlayers = document.getElementById("max-players");
            validateGame(gameName, description, location, maxPlayers, date, startTime, endTime)
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
let createGroupForm = document.getElementById("create-group-form");

if(createGroupForm){
    let errorLabel = document.getElementById("error-label")
    let statusLabel = document.getElementById("status-label")
    errorLabel.hidden = true;

    loginForm.addEventListener('submit', (event) => {
        try{
            let groupName = document.getElementById("group-name")
            let groupDescription = document.getElementById("description")
            //validateGroup(groupName, groupDescription, SOMETHING SO THAT IT VALIDATES)
            statusLabel.innerHTML = "Group Created"
            statusLabel.hidden = false;
        }
        catch(err){
            event.preventDefault();
            errorLabel.innerHTML = err;
            errorLabel.hidden = false;
        }
    })
}
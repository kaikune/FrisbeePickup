//USE THIS FOR JS YOU WANT TO APPLY TO EVERY PAGE


let headerLoginBox = document.getElementById("header-login-box");
let headerProfileBox = document.getElementById("headerProfileBox");

if(headerLoginBox && headerProfileBox){
    //DO THIS ON LAPTOP 
    
    if(req.session.user){
        headerLoginBox.classList.add("hidden")
        headerProfileBox.classList.remove("hidden")
    }
    else{
        headerProfileBox.classList.add("hidden")
        headerLoginBox.classList.remove("hidden")
    }
    
}
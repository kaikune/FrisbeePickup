let usersUL = document.getElementById("player-list");
let groupsUL = document.getElementById("group-list");
let gamesUL = document.getElementById("game-list");
let searchForm = document.getElementById("searchForm");
let searchInput = document.getElementById("searchFormInput");
let searchResetButton = document.getElementById("searchResetButton");

let addHeader = function (parentElement, text) {
    let dt = document.createElement("DT");
    dt.classList.add("list-header");
    dt.innerHTML = text;
    parentElement.appendChild(dt);
}

let addRow = function (parentElement, linkText, linkTarget) {
    let dd = document.createElement("DD");
    let a = document.createElement("A");
    a.href = linkTarget;
    a.innerHTML = linkText;
    dd.appendChild(a);
    parentElement.appendChild(dd);
};

(function ($) {

    let executeSearch = function () {
        usersUL.replaceChildren();
        groupsUL.replaceChildren();
        gamesUL.replaceChildren();
        let searchTerm = searchInput.value;
        $.ajax({
            url: "/search?term=" + searchTerm,
            method: "GET"
        }).then(function (data) {
            //console.log(data);
            let usersList = data.users;
            let groupsList = data.groups;
            let gamesList = data.games;
            addHeader(usersUL, "Players:");
            for (let i = 0; i < usersList.length; i++) {
                addRow(usersUL, usersList[i].username, "/users/" + usersList[i]._id);
            };
            addHeader(groupsUL, "Groups:");
            for (let i = 0; i < groupsList.length; i++) {
                addRow(groupsUL, groupsList[i].groupName, "/groups/" + groupsList[i]._id);
            };
            addHeader(gamesUL, "Games:");
            for (let i = 0; i < gamesList.length; i++) {
                addRow(gamesUL, gamesList[i].gameName, "/games/" + gamesList[i]._id);
            };
        });
    };

    $(searchForm).on("submit", function (event) {
        event.preventDefault();
        executeSearch();
    });

    $(searchResetButton).on("click", function (event) {
        event.preventDefault();
        searchInput.value = "";
        executeSearch();
    });

    $(searchInput).on("input", function (event) {
        event.preventDefault();
        executeSearch();
    });

    executeSearch();

})(window.jQuery);
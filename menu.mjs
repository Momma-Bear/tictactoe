const MENU_ACTIONS = [
    makeMenuItem("Play Game (PvC)", function () {startGame(1);}),
    makeMenuItem("Play Game (PvP)", function () {startGame(2);}),
    makeMenuItem("Settings", showSettings),
    makeMenuItem("Credits", showCredits),
    makeMenuItem("Quit", exitGame),
];

const SETTINGS_MENU = [
    makeMenuItem("Change language", function () {console.log("Change language");}),
    makeMenuItem("Back", function () {;}),
]

let currentMenu = MENU_ACTIONS;
showMenu(currentMenu);
let menuSelection = getMenuSelection(currentMenu); //this one might need some editing?
currentMenu[menuSelection].action();

function makeMenuItem(description, action){
    return {description, action}
}

function showMenu(menu){
    for (let i = 0; i < menu.length; i++){
        console.log(i + 1 + ". " + menu[i].description);
    }
}

function getMenuSelection(menu){
    let selection = 3; //this one needs some editing
    return selection - 1;
}

function startGame(playerCount){
    console.log("Player vs " + (playerCount == 1 ? "AI" : "Player"));
}

function showSettings() {
    currentMenu = SETTINGS_MENU;
    showMenu(currentMenu);
}

function showCredits(){
    console.log("Credits"); //this one needs some editing
}

function exitGame(){
    console.log("Exiting game...");
    setTimeout(quit, 1500);
}

function quit(){
    process.exit();
}
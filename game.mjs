import {print, askQuestion} from "./io.mjs";
import {debug, DEBUG_LEVELS} from "./debug.mjs";
import {ANSI} from "./ansi.mjs";
import DICTIONARY from "./language.mjs";
import showSplashScreen from "./splash.mjs";

const GAME_BOARD_SIZE = 3;
const PLAYER_1 = 1;
const PLAYER_2 = -1;
const player_2 = 2;
const gameOngoing = 0;
const outcomeDraw = 2;
const splashWaitTime = 2500;
const creditsWaitTime = 2000;
const exitGameWaitTime = 1500;
const menuWaitTime = 250;
const emptyCell = 0;
const notValidChoice = -1;
const lowestValidInputLength = 2;
const numberTest = 1;
const positiveNumberTest = 0;
const swapPlayer = -1;
let language = DICTIONARY.en;

const MAIN_MENU = [
    makeMenuItem(language.MENU_PVC, function () {startGame(1);}),
    makeMenuItem(language.MENU_PVP, function () {startGame(2);}),
    makeMenuItem(language.MENU_SETTINGS, showSettings),
    makeMenuItem(language.MENU_CREDITS, showCredits),
    makeMenuItem(language.MENU_QUIT, exitGame),
];

const SETTINGS_MENU = [
    makeMenuItem(language.SETTINGS_LANGUAGE, showLanguageSettings),
    makeMenuItem(language.MENU_BACK, showMainMenu),
]

const LANGUAGE_MENU = [
    makeMenuItem("English", setLanguageToEnglish),
    makeMenuItem("Norsk", setLanguageToNorsk),
    makeMenuItem(language.MENU_BACK, showSettings),
]

let currentMenu = MAIN_MENU;

let gameboard;
let currentPlayer;
let inSettings = true;

clearScreen();
showSplashScreen();
setTimeout(start, splashWaitTime);

async function start() {

    do {
    clearScreen();
    print(ANSI.COLOR.YELLOW + "MENU" + ANSI.RESET);
    showTheMenu(currentMenu);
    let menuSelection = await getMenuSelection(currentMenu);
    currentMenu[menuSelection].action();
    } while (inSettings)

}

async function startGame() {
    inSettings = false;
    let isPlaying = true;

    while (isPlaying){
        initilizeGame();
        isPlaying = await playGame();
    }
    inSettings = true;
    setTimeout(start, menuWaitTime);
}

async function playGame() {

    let outcome;
    do {
        clearScreen();
        showGameBoardWithCurrentState();
        showHUD();
        let move = await getGameMoveFromCurrentPlayer();
        updateGameBoardState(move);
        outcome = evaluateGameState();
        changeCurrentPlayer();
    } while (outcome == gameOngoing)

    if (outcome == outcomeDraw){
        showGameSummaryDraw();
    } else {
        showGameSummaryWin(outcome);
    }
    
    return await askWantToPlayAgain();
}

async function askWantToPlayAgain() {
    let answer = await askQuestion(language.PLAY_AGAIN_QUESTION);
    let playAgain = true;
    if (answer && answer.toLowerCase()[0] != language.CONFIRM){
        playAgain = false;
    }
    return playAgain;    
}

function showGameSummaryWin(outcome){
    clearScreen();
    let winningPlayer = (outcome > positiveNumberTest) ? PLAYER_1:player_2;
    let playerDescription = language.PLAYER_1;
    if (winningPlayer == player_2){
        playerDescription = language.PLAYER_2;
    }
    print(language.WINNER + playerDescription);
    showGameBoardWithCurrentState();
    print(language.GAME_OVER);
}

function showGameSummaryDraw(){
    clearScreen();
    print(language.OUTCOME_DRAW);
    showGameBoardWithCurrentState();
    print(language.GAME_OVER)
}

function changeCurrentPlayer(){
    currentPlayer *= swapPlayer;
}

function evaluateGameState(){
    let sum = gameOngoing;
    let state = gameOngoing;

    for (let row = 0; row < GAME_BOARD_SIZE; row ++){

        for (let col = 0; col < GAME_BOARD_SIZE; col++){
            sum += gameboard[row][col];
        }

        if (Math.abs(sum) == GAME_BOARD_SIZE){
            state = sum;
        }
        sum = gameOngoing;
    }

    for (let col = 0; col < GAME_BOARD_SIZE; col++){

        for (let row = 0; row < GAME_BOARD_SIZE; row++){
            sum += gameboard[row][col];
        }

        if (Math.abs(sum) == GAME_BOARD_SIZE) {
            state = sum;
        }

        sum = gameOngoing;
    }

    for (let i = 0; i < GAME_BOARD_SIZE; i++){
        sum += gameboard[i][i];
    }

    if (Math.abs(sum) == GAME_BOARD_SIZE){
        state = sum;
    }

    sum = gameOngoing;

    for (let col = 0; col < GAME_BOARD_SIZE; col++){
        let row = GAME_BOARD_SIZE - 1 - col;
        sum += gameboard[row][col]; 
    }

    if (Math.abs(sum) == GAME_BOARD_SIZE){
        state = sum;
    }

    sum = gameOngoing;

    if (checkForDraw() == true){
        return outcomeDraw;
    }

    let winner = state / GAME_BOARD_SIZE;
    return winner;
}

function checkForDraw(){
    let draw = true;
    for (let row = 0; row < GAME_BOARD_SIZE; row++){

        for (let col = 0; col < GAME_BOARD_SIZE; col++){
            if (gameboard[row][col] == 0){
                draw = false;
            }
        }
    }

    return draw;
}

function updateGameBoardState(move){
    const ROW_ID = 0;
    const COLUMN_ID = 1;
    gameboard[move[ROW_ID]][move[COLUMN_ID]] = currentPlayer;
}

async function getGameMoveFromCurrentPlayer() {
    let position = null;
    do {
        let rawInput = await askQuestion(language.PLAYER_PROMPT);
        position = rawInput.split(" ");
    } while (isValidPositionOnBoard(position) == false)
    
    return position;
}

function isValidPositionOnBoard(position){
    const ROW_ID = 0;
    const COLUMN_ID = 1;
    const lowestValidOption = 0;

    if (position.length < lowestValidInputLength){
        return false;
    }

    let isValidInput = true;
    if (position[COLUMN_ID] * numberTest != position[COLUMN_ID] && position[ROW_ID] * numberTest != position[ROW_ID]){
        isValidInput = false;
    } else if (position[COLUMN_ID] > GAME_BOARD_SIZE || position[ROW_ID] > GAME_BOARD_SIZE){
        isValidInput = false;
    } else if (position[COLUMN_ID] < lowestValidOption || position[ROW_ID] < lowestValidOption){
        isValidInput = false;
    } else if (gameboard[position[ROW_ID]][position[COLUMN_ID]] != emptyCell){
        isValidInput = false;
    }

    return isValidInput;
}

function showHUD(){
    let playerDescription = language.PLAYER_1;
    if (PLAYER_2 == currentPlayer){
        playerDescription = language.PLAYER_2;
    }
    print(language.PLAYER + playerDescription + language.YOUR_TURN);
}

function showGameBoardWithCurrentState(){
    for (let currentRow = 0; currentRow < GAME_BOARD_SIZE; currentRow++){
        let rowOutput = "";
        for (let currentCol = 0; currentCol < GAME_BOARD_SIZE; currentCol++){
            let cell = gameboard[currentRow][currentCol];
            if (cell == emptyCell) {
                rowOutput += "_ ";
            } else if (cell > positiveNumberTest){
                rowOutput += "X ";
            } else {
                rowOutput += "O ";
            }
        }

        print(rowOutput);
    }
}

function initilizeGame(){
    clearScreen();
    gameboard = createGameBoard();
    currentPlayer = PLAYER_1;
}

function createGameBoard(){
    let newBoard = new Array(GAME_BOARD_SIZE);

    for (let currentRow = 0; currentRow < GAME_BOARD_SIZE; currentRow++){
        let row = new Array(GAME_BOARD_SIZE);
        for (let currentCol = 0; currentCol < GAME_BOARD_SIZE; currentCol++){
            row[currentCol] = emptyCell;
        }
        newBoard[currentRow] = row;
    }

    return newBoard;
}

function clearScreen(){
    console.log(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME, ANSI.RESET);
}

async function getMenuSelection(menu){
    let choice = notValidChoice;
    let validChoice = false;

    while (!validChoice){
    
    choice = await askQuestion("");
    
        if(choice * numberTest == choice && choice <= menu.length){
            validChoice = true;
        }
    }
    return choice - 1;
}

function makeMenuItem(description, action){
    return {description, action}
}

function showTheMenu(menu){
    for (let i = 0; i < menu.length; i++){
        console.log(i + 1 + ". " + menu[i].description);
    }
}

function showSettings(){
    currentMenu = SETTINGS_MENU;
}

function showMainMenu(){
    currentMenu = MAIN_MENU;
}

function showLanguageSettings(){
    currentMenu = LANGUAGE_MENU;
}

function showCredits(){
    clearScreen();
    print(language.CREDITS);
    inSettings = false;
    setTimeout(start, creditsWaitTime);
}

function exitGame(){
    clearScreen();
    print(language.EXIT);
    inSettings = false;
    setTimeout(quit, exitGameWaitTime);
}

function quit(){
    process.exit();
}

function setLanguageToEnglish(){
    language = DICTIONARY.en;
    currentMenu = SETTINGS_MENU;

}

function setLanguageToNorsk(){
    language = DICTIONARY.no;
    currentMenu = SETTINGS_MENU;
}


import {print, askQuestion} from "./io.mjs";
import {debug, DEBUG_LEVELS} from "./debug.mjs";
import {ANSI} from "./ansi.mjs";
import DICTIONARY from "./language.mjs";
import showSplashScreen from "./splash.mjs";

const GAME_BOARD_SIZE = 3;
const numberOfCells = GAME_BOARD_SIZE * GAME_BOARD_SIZE;
const PLAYER_1 = 1;
const PLAYER_2 = -1;
const player_2 = 2;
const pvp = 2;
const gameOngoing = 0;
const outcomeDraw = 2;
const splashWaitTime = 2500;
const creditsWaitTime = 2000;
const exitGameWaitTime = 1000;
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

async function startGame(playerCount) {
    inSettings = false;
    let isPlaying = true;

    while (isPlaying){
        initilizeGame();
        isPlaying = await playGame(playerCount);
    }
    inSettings = true;
    setTimeout(start, menuWaitTime);
}

async function playGame(playerCount) {

    let outcome;
    do {
        clearScreen();
        showGameBoardWithCurrentState();
        showHUD(playerCount);
        let move = await getGameMoveFromCurrentPlayer(playerCount);
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

function showGameSummaryWin(outcome, playerCount){
    clearScreen();
    let winningPlayer = (outcome > positiveNumberTest) ? PLAYER_1:player_2;
    let winnerDescription = ANSI.COLOR.RED + language.PLAYER_1_WINNER;
    if (winningPlayer == player_2){
        if (playerCount == pvp){
            winnerDescription = ANSI.COLOR.GREEN + language.PLAYER_2_WINNER;
        } else {
            winnerDescription = ANSI.COLOR.BLUE + language.CPU_WINNER; 
        }
        
    }

    showGameBoardWithCurrentState();
    print(language.WINNER + winnerDescription);
    print("");
    print(ANSI.COLOR.YELLOW + language.GAME_OVER + ANSI.RESET);
    print("");
}

function showGameSummaryDraw(){
    clearScreen();
    showGameBoardWithCurrentState();
    print(language.OUTCOME_DRAW);
    print("");
    print(ANSI.COLOR.YELLOW + language.GAME_OVER + ANSI.RESET);
    print("");
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
    if (state != GAME_BOARD_SIZE && checkForDraw() == true){
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

async function getGameMoveFromCurrentPlayer(playerCount) {
    let position = null;
    if (playerCount == 1){
        if (currentPlayer == PLAYER_1){
            do {
                let rawInput = await askQuestion(language.PLAYER_PROMPT);
                position = rawInput.split(" ");
            } while (isValidPositionOnBoard(position) == false)
        } else {
            do {
                position = [randomNumberGenerator(), randomNumberGenerator()];
            } while (isValidPositionOnBoard(position) == false)
        } 
    } else if (playerCount = pvp){
        do {
            let rawInput = await askQuestion(language.PLAYER_PROMPT);
            position = rawInput.split(" ");
        } while (isValidPositionOnBoard(position) == false)
    }
    
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

function showHUD(playerCount){
    let playerDescription = ANSI.COLOR.RED + PLAYER_1;
    if (playerCount == pvp){
        if (PLAYER_2 == currentPlayer){
            playerDescription = ANSI.COLOR.GREEN + player_2;
        }
        print(language.PLAYER + playerDescription + ANSI.RESET + language.YOUR_TURN);
        print("");
    } else {
        if (PLAYER_2 == currentPlayer){
            print(language.CPU_TURN);
            print ("");
        } else {
            print(language.PLAYER + playerDescription + ANSI.RESET + language.YOUR_TURN);
            print("");
        }
    }

}

function showGameBoardWithCurrentState(){
    let grid = [];
    for (let currentRow = 0; currentRow < GAME_BOARD_SIZE; currentRow++){
        let fullRow = [];
        for (let currentCol = 0; currentCol < GAME_BOARD_SIZE; currentCol++){
            let cell = gameboard[currentRow][currentCol];
            if (cell == emptyCell) {
                grid.push("   ");
            } else if (cell > positiveNumberTest){
                grid.push(" X ");
            } else {
                grid.push(" O ");
            }
            
        }
    
    }

    let gridArt = [ `
        1     2     3
     ___________________
     |     |     |     |
   1 | `,` | `,` | `,` |
     |_____|_____|_____|
     |     |     |     |
   2 | `,` | `,` | `,` |
     |_____|_____|_____|
     |     |     |     |
   3 | `,` | `,` | `,` |
     |_____|_____|_____|

   `
   ];

   let completeBoard = [];

   for (let i = 0; i < numberOfCells; i++){
        completeBoard.push(gridArt[i]);
        completeBoard.push(grid[i]);
   }
   completeBoard.push(gridArt[numberOfCells]);

   for (let i = 0; i < completeBoard.length; i++){
        if (completeBoard[i] == " X "){
            process.stdout.write(`${ANSI.COLOR.RED + completeBoard[i]}`);
        } else if (completeBoard[i] == " O "){
            process.stdout.write(`${ANSI.COLOR.GREEN + completeBoard[i]}`);
        } else {
            process.stdout.write(`${ANSI.RESET + completeBoard[i]}`);
        }

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
        print(ANSI.COLOR.BLUE + (i + 1) + ". " + ANSI.RESET + menu[i].description);
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

function randomNumberGenerator(){
    let randomNumber = Math.random() * (GAME_BOARD_SIZE - 1);
    let roundedNumber = Math.round(randomNumber);
    
    return (roundedNumber)
}
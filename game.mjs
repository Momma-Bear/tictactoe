import {print, askQuestion} from "./io.mjs";
import {debug, DEBUG_LEVELS} from "./debug.mjs";
import {ANSI} from "./ansi.mjs";
import DICTIONARY from "./language.mjs";
import showSplashScreen from "./splash.mjs";
import {makeMenuItem, showTheMenu} from "./menu.mjs";

const GAME_BOARD_SIZE = 3;
const PLAYER_1 = 1;
const PLAYER_2 = -1;
const gameOngoing = 0;
const outcomeDraw = 2;
const splashWaitTime = 2500;
const emptyCell = 0;
const notValidChoice = -1;
const lowestValidInputLength = 2;
const numberTest = 1;
const positiveNumberTest = 0;
const swapPlayer = -1;

const MENU_CHOICES = {
    MENU_CHOICE_START_GAME: 1,
    MENU_CHOICE_SHOW_SETTINGS: 2,
    MENU_CHOICE_EXIT_GAME: 3
};

const NO_CHOICE = -1;

let language = DICTIONARY.en;
let gameboard;
let currentPlayer;

clearScreen();
showSplashScreen();
setTimeout(start, splashWaitTime);

async function start() {
    
    do {

        let chosenAction = NO_CHOICE;
        chosenAction = await showMenu();

        if (chosenAction == MENU_CHOICES.MENU_CHOICE_START_GAME){
            await runGame();
        } else if (chosenAction == MENU_CHOICES.MENU_CHOICE_SHOW_SETTINGS){
            asdfd
        } else if (chosenAction == MENU_CHOICES.MENU_CHOICE_EXIT_GAME){
            clearScreen();
            process.exit();
        }
    } while (true)

}

async function runGame() {
    
    let isPlaying = true;

    while (isPlaying){
        initilizeGame();
        isPlaying = await playGame();
    }
}

async function showMenu() {
    
    let choice = notValidChoice;
    let validChoice = false;

    while (!validChoice){
        clearScreen();
        print(ANSI.COLOR.YELLOW + "MENU" + ANSI.RESET);
        print("1. Play Game");
        print("2. Settings");
        print("3. Exit Game");

        choice = await askQuestion("");

        if([MENU_CHOICES.MENU_CHOICE_START_GAME, MENU_CHOICES.MENU_CHOICE_SHOW_SETTINGS, MENU_CHOICES.MENU_CHOICE_EXIT_GAME].includes(Number(choice))){
            validChoice = true;
        }
    }

    return choice;
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
    let winningPlayer = (outcome > positiveNumberTest) ? 1:2;
    print("Winner is player " + winningPlayer);
    showGameBoardWithCurrentState();
    print("GAME OVER");
}

function showGameSummaryDraw(){
    clearScreen();
    print("Game is a draw");
    showGameBoardWithCurrentState();
    print("GAME OVER")
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
        let rawInput = await askQuestion("Place your mark at: ");
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
    let playerDescription = "one";
    if (PLAYER_2 == currentPlayer){
        playerDescription = "two";
    }
    print("Player " + playerDescription + " it is your turn");
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
import './App.css';
import { useEffect } from 'react';
import io from 'socket.io-client';




function App() {

  const socket = io('http://127.0.0.1:3000', { transports: ['websocket'], upgrade: false });

  socket.on('join', (data) => {
    console.log(data);
  });
  
  socket.on('submitMove', (data) => {
    console.log(data);
  });

  /*socket.emit('join', {playerId: 1}, function (resData, jwres){
    console.log('i', resData)
  });*/

  const X_CLASS = 'x'
  const CIRCLE_CLASS = 'circle'
  const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ]
  

  let cellElements, board, winningMessageElement, restartButton, winningMessageTextElement, circleTurn;
  

  useEffect(() => { 
    
    board = document.getElementById('board'); 
    winningMessageElement = document.getElementById('winningMessage'); 
    restartButton = document.getElementById('restartButton');
    cellElements = document.querySelectorAll('[data-cell]');
    winningMessageTextElement = document.querySelector('[data-winning-message-text]');

    winningMessageElement.classList.add('show');

    startGame();
    restartButton.addEventListener('click', restartGame);
  }, []); 
  
  
  let startGame = () => {

    circleTurn = false;

    cellElements.forEach(cell => {
      cell.classList.remove(X_CLASS)
      cell.classList.remove(CIRCLE_CLASS)
      cell.removeEventListener('click', handleClick)
      cell.addEventListener('click', handleClick, { once: true })
    });

    document.getElementById("audio").play();

    setBoardHoverClass();
  }


  let restartGame = () => {

    startGame();
    winningMessageElement.classList.remove('show');
  }

  
  let handleClick = (e) => {

    const cell = e.target;

    const currentClass = circleTurn ? CIRCLE_CLASS : X_CLASS;

    placeMark(cell, currentClass);

    if (checkWin(currentClass)) {
      endGame(false)
    } else if (isDraw()) {
      endGame(true)
    } else {
      swapTurns();
      setBoardHoverClass();
    }
  }
  

  let endGame = (draw) => {

    if (draw) {
      winningMessageTextElement.innerText = 'Draw!'
    } else {
      winningMessageTextElement.innerText = `${circleTurn ? "O's" : "X's"} Wins!`
    }

    winningMessageElement.classList.add('show');
  }
  

  let isDraw = () => {

    return [...cellElements].every(cell => {
      return cell.classList.contains(X_CLASS) || cell.classList.contains(CIRCLE_CLASS)
    })
  }

  
  let placeMark = (cell, currentClass) => {

    cell.classList.add(currentClass)
  }
  

  let swapTurns = () => {

    circleTurn = !circleTurn
  }
 
  
  let setBoardHoverClass = () => {

    board.classList.remove(X_CLASS);
    board.classList.remove(CIRCLE_CLASS);

    if (circleTurn) {
      board.classList.add(CIRCLE_CLASS);
    } else {
      board.classList.add(X_CLASS);
    }
  }
  
  
  let checkWin = (currentClass) => {

    return WINNING_COMBINATIONS.some(combination => {
      return combination.every(index => {
        return cellElements[index].classList.contains(currentClass)
      })
    })
  }


  return (
    <div className="App">
      <header className="header">
        Tic-Tac-Toe Game
      </header>
      <div className="board" id="board">
        <div className="cell" data-cell></div>
        <div className="cell" data-cell></div>
        <div className="cell" data-cell></div>
        <div className="cell" data-cell></div>
        <div className="cell" data-cell></div>
        <div className="cell" data-cell></div>
        <div className="cell" data-cell></div>
        <div className="cell" data-cell></div>
        <div className="cell" data-cell></div>
      </div>
      <div className="winning-message" id="winningMessage">
        <div data-winning-message-text></div>
        <button id="restartButton">
          Start
        </button>
      </div>

      <audio src="audio/intro.mp3" autoPlay={true} id="audio" controls hidden>
      </audio>
    </div>
  );
}

export default App;

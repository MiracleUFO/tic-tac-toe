import './App.css';
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';




function App() {

  let BASEURL = 'http://192.168.43.120:3000';

  const socket = io(`${BASEURL}`, { transports: ['websocket'], upgrade: false });

  const [PLAYER_ID] = useState(uuidv4());
  const [MATCH_ID, setMatchId] = useState('')
  const [YOUR_MARK, setYourMark] = useState('');
  const [OTHERS_MARK, setOthersMark] = useState('');
  const [otherPlayerJoined, setOtherJoined] = useState(false);

  let matchIdRef = useRef(MATCH_ID);
  let playerMarkRef = useRef(YOUR_MARK);

  //  Classes for conditional CSS 
  const X_CLASS = 'x'
  const CIRCLE_CLASS = 'circle'
 
  let cellElements = useRef(), board, winningMessageElement = useRef(), errorMessageElement = useRef(), winningMessageTextElement = useRef(), errorMessageTextElement = useRef();
  let restartButton, circlePlayer;
  
  const setMatchIdRef = (data) => {

    matchIdRef.current = data;
    setMatchId(data);
  };


  const setPlayerMarkRef = (data) => {

    playerMarkRef.current = data;
    setYourMark(data);
  };


  useEffect(() => { 
    
    board = document.getElementById('board');  
    restartButton = document.getElementById('restartButton');

    winningMessageElement.current.classList.add('show');
    restartButton.addEventListener('click', startGame);
  }, []);


  useEffect(() => {

    socket.on('join', (data) => { 
      if (Object.keys(data.players).length === 2 && MATCH_ID === data.matchId) {
        setOtherJoined(true);
      }   
    });

    socket.on('submitMove', (data) => { 
      console.log(data);

      if (data.matchId === MATCH_ID) {

        let unfurledBoard = [];
  
        data.board.forEach((entry) => {
          unfurledBoard = [...unfurledBoard, ...entry]
        })

        setBoardInUI(unfurledBoard);

        if (data.gameOver) {
          endGame(data.winner)
        }
      }
    });
  }, [MATCH_ID])


  let startGame = () => {

    axios.post(`${BASEURL}/play`, { playerId: PLAYER_ID })
    .then(response => {
      
      const responseResult = {...response.data.result};
  
      setMatchIdRef(responseResult.matchId);

      if (Object.keys(responseResult.players).length === 2) {
        setOtherJoined(true);
      }
  
      circlePlayer = responseResult.player === 'O' ? true : false;

      setPlayersInUI(responseResult.player);

      resetBoard();
  
      let unfurledBoard = [];
  
      responseResult.board.forEach((entry) => {
        unfurledBoard = [...unfurledBoard, ...entry]
      })
  
     
      setBoardInUI(unfurledBoard);
  
      setBoardHoverClass();
  
      playGameIntro();
    });

    winningMessageElement.current.classList.remove('show');
  }


  let resetBoard = () => {

    cellElements.current.childNodes.forEach(cell => {

      cell.removeEventListener('click', handleClick);
      cell.addEventListener('click', handleClick);
      cell.classList.remove('x');
      cell.classList.remove('circle');
    }); 
  }


  let playGameIntro = () => {

    let audio = document.getElementById("audio");
    audio.volume = 0.1;
    audio.play(); 
  }


  let setBoardInUI = (boardArray) => {

    let unfurledBoardObject = {}, i = 0, cellElementsArray = Array.from(cellElements.current.childNodes), cellElementsObject = {}, j = 0;
    
    for (const key of boardArray) {    
      unfurledBoardObject = {...unfurledBoardObject, [i]: key};
      i++
    }

    for (const key of cellElementsArray) {
      cellElementsObject = {...cellElements.current.childNodes, [j]: key};
      j++
    }
    
    for (const [ k, v ] of Object.entries(unfurledBoardObject)) {
      for (const [ key, val ] of Object.entries(cellElementsObject)) {

        let markClass = v === 'X' ? 'x' :  v === 'O' ? 'circle' : 'cell';

        if (k === key) {
          val.classList.add(markClass);
          cellElements.current.replaceChild(val, cellElements.current.childNodes.item(k))
        }
      }
    }
  }


  let setPlayersInUI = (player) => {

    if (player === 'X') {
      setPlayerMarkRef('X');
      setOthersMark('O')
    } else {
      setPlayerMarkRef('O');
      setOthersMark('X');
    }
  }


  let setBoardHoverClass = () => {

    board.classList.remove(X_CLASS);
    board.classList.remove(CIRCLE_CLASS);

    if (circlePlayer) {
      board.classList.add(CIRCLE_CLASS);
    } else {
      board.classList.add(X_CLASS);
    }
  }

  
  let handleClick = (e) => {

    const cell = e.target;

    let row, column;

    cellElements.current.childNodes.forEach((value, index) => {

      if (value === e.target) {

        if (index === 0 || index === 1 || index === 2) {
          row = 0; column = index;
        }

        switch(index) {
            case 3:
              row = 1; column = 0;
              break;
            case 4:
              row = 1; column = 1;
              break;
            case 5:
              row = 1; column = 2;
              break;
            case 6:
              row = 2; column = 0;
              break;
            case 7:
              row = 2; column = 1;
              break;
            case 8:
              row = 2; column = 2;
              break;
          default:
        }
      }
      return;
    });

    let params = {
      player: playerMarkRef.current,
      matchId: matchIdRef.current,
      row: row,
      column: column
    }

    axios.post(`${BASEURL}/submitMove`, params)
      .then(response => {

        if (!response.data.result) {
          if (cell.classList.contains('x') || cell.classList.contains('circle')) {
            errorMessageTextElement.current.innerText = `Space already filled`;
          } else {
            errorMessageTextElement.current.innerText = `Not your turn`;
          }

          errorMessageElement.current.classList.add('show');
          
          setTimeout(() => { 
            errorMessageElement.current.classList.remove('show')
          }, 2000)
        } else {
           placeMark(cell, playerMarkRef.current);
        }
      })  
  }


  let placeMark = (cell, player) => {

    let currentClass = player === 'X' ? 'x' : 'circle';
  
    cell.classList.add(currentClass)
  }
  
  
  let endGame = (winner) => {

    winningMessageTextElement.current.innerText = winner ? `${winner}'s Wins!` : 'Draw!';

    winningMessageElement.current.classList.add('show');
  }
  

  return (
    <div className="App">
      <header className="header">
        <h1>Tic-Tac-Toe</h1>
        <div id="playerBoard">
          <p>{MATCH_ID ? `GAME ID: ${MATCH_ID}` : ''}</p>
          <div><span><b>You ({YOUR_MARK})</b></span> vs <span><b>Player ({OTHERS_MARK}) {otherPlayerJoined ? '(joined)' : '(not joined)'}</b></span></div>
        </div>
      </header>
      <div className="board" id="board" ref={cellElements}>
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

      <div className="message" id="winningMessage" ref={winningMessageElement}>
        <div data-winning-message-text ref={winningMessageTextElement}></div>
        <button id="restartButton">
          Start
        </button>
      </div>

      <div className="message" id="errorMessage" ref={errorMessageElement}>
        <div data-error-message-text ref={errorMessageTextElement}></div>
      </div>

      <audio src="audio/intro.mp3" autoPlay={true} id="audio" controls hidden>
      </audio>
    </div>
  );
}

export default App;

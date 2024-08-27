import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Board from './board';
import History from './history';
import Winner from './winner';
import Invalid from './invalid';

const socket = io('http://localhost:8081'); // This is mapped to the server port

const App = () => {
  const [gameState, setGameState] = useState(null);
  const [history, setHistory] = useState([]);
  const [winner, setWinner] = useState(null);
  const [invalidMoveMessage, setInvalidMoveMessage] = useState(null);

  useEffect(() => {
    // adding'init'(enent-listenr) event to start the game
    socket.emit('init', { event: 'Initiating Game', id: 'Player1', current_selected_pawn: 'P1' });

    // listening gameState event from the server
    socket.on('gameState', (data) => {
      setGameState(data);
      setInvalidMoveMessage(null);
    });

    // handling move callback from the server
    socket.on('move_response', (data) => {
      if (data.invalid) {
        setInvalidMoveMessage(data.message);
      } else {
        setGameState(data.gameState);
        setHistory(data.history);
        if (data.winner) setWinner(data.winner);
      }
    });
  }, []);

  const handleMove = (move) => {
    socket.emit('move', { event: 'Move', id: 'Player1', move, current_selected_pawn: 'P1' });
  };

  return (
    <div className="app">
      <h1>Game Board</h1>
      <Board gameState={gameState} handleMove={handleMove} />
      <History history={history} />
      <Winner winner={winner} />
      <Invalid message={invalidMoveMessage} />
    </div>
  );
};

export default App;

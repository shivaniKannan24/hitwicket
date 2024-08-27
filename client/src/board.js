import React, { useState, useEffect } from 'react';
import Pawn from './Pawn';

const Board = ({ gameState, handleMove }) => {
  const [board, setBoard] = useState([]);

  useEffect(() => {
    if (gameState) {
      setBoard(gameState.board); // Assuming gameState has a board property
    }
  }, [gameState]);

  const onCellClick = (cell) => {
    handleMove(cell);
  };

  return (
    <div className="board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, cellIndex) => (
            <div key={cellIndex} className="cell" onClick={() => onCellClick(cell)}>
              {cell.pawn && <Pawn player={cell.player} pawn={cell.pawn} />}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Board;

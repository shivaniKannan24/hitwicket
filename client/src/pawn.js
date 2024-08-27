import React from 'react';

const Pawn = ({ player, pawn }) => {
  const pawnStyle = {
    backgroundColor: player === 'Player1' ? 'blue' : 'red',
    color: 'white',
    padding: '10px',
    borderRadius: '50%',
    display: 'inline-block',
    textAlign: 'center',
  };

  return <div style={pawnStyle}>{pawn}</div>;
};

export default Pawn;

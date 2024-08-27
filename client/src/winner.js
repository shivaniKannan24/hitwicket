import React from 'react';

const Winner = ({ winner }) => {
  return (
    <div className="winner">
      {winner ? <h2>Winner: {winner}</h2> : <h2>No winner yet</h2>}
    </div>
  );
};

export default Winner;

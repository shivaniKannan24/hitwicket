import React from 'react';

const History = ({ history }) => {
  return (
    <div className="history">
      <h2>Move History</h2>
      <ul>
        {history.map((move, index) => (
          <li key={index}>{move}</li>
        ))}
      </ul>
    </div>
  );
};

export default History;
import React from 'react';

const Invalid = ({ message }) => {
  return (
    <div className="invalid">
      {message && <h3>Invalid Move: {message}</h3>}
    </div>
  );
};

export default Invalid;

const socket = new WebSocket('ws://localhost:8080');

socket.addEventListener('open', () => {
    console.log('Connected to server');
});

socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
        case 'init':
            initializeGame(data);
            break;
        case 'update':
            updateGameState(data.state);
            break;
        case 'invalid-move':
            alert('Invalid move!');
            break;
        case 'game-over':
            alert(`Game over! Winner: ${data.winner}`);
            break;
    }
});

function initializeGame(data) {
    // Set up the initial game state and UI
}

function updateGameState(state) {
    // Update the game board and UI based on the new state
}

function sendMove(character, move) {
    const message = {
        type: 'move',
        char: character,
        move: move
    };
    socket.send(JSON.stringify(message));
}

const { a } = require('react-spring');
const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

//Game state
let gameState = {
    board: Array(5).fill(null).map(() => Array(5).fill(null)),
    turn: 'Player1',
    players: {"Player1":["P1", "P2", "H1", "H2", "P3"],"Player2":["P1", "P2", "H1", "H2", "P3"]},
    winner: null,
    current_player: null,
};

//Player1 is A and Player2 is B
function getPlayer() {
    return {"Player1":"A", "Player2":"B"};
}

// Initialize the board with players and their characters
function initializeBoard(player) {
    gameState.board[0] = ['A.P1', 'A.P2', 'A.H1', 'A.H2', 'A.P3']; // Player1's setup
    gameState.board[4] = ['B.P1', 'B.P2', 'B.H1', 'B.H2', 'B.P3']; // Player2's setup
    gameState.current_player = getPlayer()[player];
}

function mapDirection(moves, currentPosition) {
    let directionMapper = {};
    const [x1, y1] = currentPosition;//[0,0]

    for (let i = 0; i < moves.length; i++) {
        const [x, y] = moves[i];//[0,1]

        if (x === x1 && y === y1 - 1) {
            directionMapper['L'] = moves[i];  // Left
        } else if (x === x1 && y === y1 + 1) {
            directionMapper['R'] = moves[i];  // Right
        } else if (x === x1 + 1 && y === y1) {
            directionMapper['F'] = moves[i];  // Forward
        } else if (x === x1 - 1 && y === y1) {
            directionMapper['B'] = moves[i];  // Backward
        } else if (x === x1 - 1 && y === y1 + 2) {
            directionMapper['FL'] = moves[i];  // Forward-Left
        } else if (x === x1 + 1 && y === y1 + 2) {
            directionMapper['FR'] = moves[i];  // Forward-Right
        } else if (x === x1 - 1 && y === y1 - 2) {
            directionMapper['BL'] = moves[i];  // Backward-Left
        } else if (x === x1 + 1 && y === y1 - 2) {
            directionMapper['BR'] = moves[i];  // Backward-Right
        } else if (x === x1 + 2 && y === y1 + 1) {
            directionMapper['RF'] = moves[i];  // Right-Forward
        } else if (x === x1 + 2 && y === y1 - 1) {
            directionMapper['RB'] = moves[i];  // Right-Backward
        } else if (x === x1 - 2 && y === y1 + 1) {
            directionMapper['LF'] = moves[i];  // Left-Forward
        } else if (x === x1 - 2 && y === y1 - 1) {
            directionMapper['LB'] = moves[i];  // Left-Backward
        }
    }
    return directionMapper;
}


function getPawnMoves(x, y) {
    let moves = [[x, y + 1], [x + 1, y], [x - 1, y], [x, y - 1]];
    let output = [];
    for (let i = 0; i < moves.length; i++) {
        const [x1, y1] = moves[i];
        if(x1 >= 0 && x1 < 5 && y1 >= 0 && y1 < 5){
            output.push(moves[i]);
        }
    }
    directionMapper = mapDirection(output, [x, y]);
    return directionMapper;
}

function getHeroOneMoves(x, y) {
    let moves = [
        [x, y + 2], // B: 1 step Backward
        [x + 2, y], // R: 1 step Right
        [x - 2, y], // L: 1 step Left
        [x, y - 2], // F: 1 step Forward
    ];

    let output = moves.filter(move => 
        move[0] >= 0 && move[0] < 5 && move[1] >= 0 && move[1] < 5
    );
    let directionMapper = mapDirection(output, [x, y]);
    return directionMapper;
}
function getHeroTwoMoves(x, y) {
    let moves = [
        [x - 1, y + 2],  // FL: 2 steps Forward, 1 step Left
        [x + 1, y + 2],  // FR: 2 steps Forward, 1 step Right
        [x - 1, y - 2],  // BL: 2 steps Backward, 1 step Left
        [x + 1, y - 2],  // BR: 2 steps Backward, 1 step Right
        [x + 2, y + 1],  // RF: 2 steps Right, 1 step Forward
        [x + 2, y - 1],  // RB: 2 steps Right, 1 step Backward
        [x - 2, y + 1],  // LF: 2 steps Left, 1 step Forward
        [x - 2, y - 1]   // LB: 2 steps Left, 1 step Backward
    ];

    let output = moves.filter(move => 
        move[0] >= 0 && move[0] < 5 && move[1] >= 0 && move[1] < 5
    );
    let directionMapper = mapDirection(output, [x, y]);
    return directionMapper;
}


// Get valid moves based on the character and position
function getValidMoves(character, position) {
    // This should return a hashmap of valid position along with the direction
    const [x, y] = position;
    let moves = [];

    switch (character) {
        case 'P1' || 'P2':
            moves = getPawnMoves(x, y);
            break;
        case 'H1':
            moves = getHeroOneMoves(x, y);
            break;
        case 'H2' || 'H3':
            moves = getHeroTwoMoves(x, y);
            break;
        default:
            console.log('Invalid character:', character);
            return false;
    }
    return moves;
}

// Function to process a move
function processMove(player, move) {
    const [character, direction] = move.split(':'); // E.g., 'P1:L' || A.P1:L'
    //this is to attain the current position of the character(Example: P1 in position [0,0])
    const currentPosition = findCharacterPosition(player, character);
    const curr_char = character.split('.')[0];
    if (!currentPosition) return false;
    //this is to get the valid moves of the character
    //Example: P1 can move to [0,1],[1,0] in hashmap
    const validMoves = getValidMoves(curr_char, currentPosition);

    // Find the new position based on direction
    let newPosition = validMoves[direction];
    //2 and 3.if there is no valid move(outof bound and invalid move), return false
    if(newPosition == false || newPosition == {}) return false;

    // If newPosition is valid, update the board
    if (validMoves) {
        //1.check if the character is in the players array
        if(!gameState.players[gameState.turn].includes(curr_char)){
            return false;
        }
        //2.check if the character is in the board
        if(gameState.board[currentPosition[0]][currentPosition[1]] === null){
            return false;
        }
        //3.find all friends
        let friends, friends_positions = findAllFriends(gameState.turn);
        //4.check if the character is in the friends array
        if(!friends.includes(curr_char)){
            return false;
        }
        //5.check if newPosition is in the friends_positions array
        if(isFriendPlace(friends_positions, currentPosition)){
            return false;
        }
        gameState.board[currentPosition[0]][currentPosition[1]] = null; // Clear old position
        gameState.board[newPosition[0]][newPosition[1]] = character; // Set new position
        //Remove opponent's character
        const remove  = removeOpponentCharacter(player, newPosition[1]);
        console.log(remove);
        return true;
    }
    return false;
}

//check if it is a friend place
function isFriendPlace(friend_positions, current_position){
    for (let i = 0; i < friend_positions.length; i++) {
        if(friend_positions[i][0] === current_position[0] && friend_positions[i][1] === current_position[1]){
            return true;
        }
    }
    return false;
}

// Finding the position of a character on the board
function findCharacterPosition(player, character) {
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            board = gameState.board[i][j].split('.');
            if ((player === board[0] && character === board[1]) || character === gameState.board[i][j]) {
                return [i, j];
            }
        }
    }
    return null;
}

//Searching for the opponent's character
function removeOpponentCharacter(player, y) {
    for (let i = 0; i < 5; i++) {
        board = gameState.board[i][y]?.split('.');
        //ensure that the character is not belong to the current player's team
        if (board!=null && board[0] != gameState.current_player) {
            //remove the character from the board
            let arr = gameState.players[player];
            let index = arr.indexOf(board);
            arr.splice(index, 1);
            //update the players array
            gameState.players[player] = arr;
            gameState.board[i][y] = null;
            gae
        }
    }
    return "No Character has been removed";
}

//Finding All Friends Positions
function findAllFriends(player) {
    player = gameState.current_player || getPlayer()[player];
    let friends = [];
    let friends_positions = [];
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            board = gameState.board[i][j].split('.');
            if (gameState.current_player === board[0]) {
                friends.push(board[1]);
                friends_positions.push([i, j]);
            }
        }
    }
    return friends, friends_positions;
}

//check if the game is over
function checkWinner() {
    player = gameState.current_player
    current_player = gameState.turn
    opponent = player == 'A'? "Player2" : "Player1";
    opt_status = gameState.players[opponent].length;
    curr_player_status = gameState.players[current_player].length;
    if(opt_status == 0){
        gameState.winner = player;
        return true;
    } else if (curr_player_status == 0){
        gameState.winner = opponent;
        return true;
    } else{
        console.log("No Winner Found yet");
        return false;
    }
}

// Handle socket connections
server.on('connection', (socket) => {
    console.log('Player Connected:', socket.id);
    //socket.id = Player1, Player2

    // Initialize board for new players
    initializeBoard(socket.id);

    // Send initial game state
    socket.emit('gameState', gameState);

    // Handle move event
    socket.on('move', (move) => {
        const player = socket.id;

        if (player === gameState.turn) {
            const moveSuccess = processMove(player, move);

            if (moveSuccess) {
                // Switching turn to the other player
                gameState.turn = gameState.turn === 'Player1' ? 'Player2' : 'Player1';
                let status = checkWinner();
                if(status){
                    socket.emit('winner', gameState.winner);
                     // Sending updated game state to frontend
                    socket.emit('gameState', gameState);
                } else{
                    socket.send('Game is still ongoingm, let\'s play again!');
                    // Sending updated game state to frontend
                    socket.emit('gameState', gameState);
                }
            } else {
                socket.emit('invalidMove', 'Invalid move! Try again.');
            }
        }
    });

    socket.on('close', () => {
        console.log('Player disconnected:', socket.id);
      });
    
    socket.send('Welcome to an Advanced Chess Game!');

    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
    });
});
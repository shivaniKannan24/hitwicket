const WebSocket = require('ws');
const Game = require('./game');

class WebSocketServer {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.game = new Game();
        this.clients = {};

        this.wss.on('connection', (ws) => this.onConnection(ws));
    }

    onConnection(ws) {
        const player = this.assignPlayer(ws);
        ws.send(JSON.stringify({ type: 'init', player, state: this.game.getGameState() }));

        ws.on('message', (message) => {
            const data = JSON.parse(message);
            this.handleMessage(player, data);
        });
    }

    assignPlayer(ws) {
        // Assign player A or B to the connecting client
    }

    handleMessage(player, data) {
        switch (data.type) {
            case 'move':
                this.handleMove(player, data);
                break;
            // Handle other message types
        }
    }

    handleMove(player, data) {
        if (this.game.currentTurn !== player) return;

        const { char, move } = data;
        if (this.game.isValidMove(player, char, move)) {
            this.game.processMove(player, char, move);
            this.broadcastState();
        } else {
            this.sendInvalidMove(player);
        }
    }

    broadcastState() {
        const state = this.game.getGameState();
        this.wss.clients.forEach((client) => {
            client.send(JSON.stringify({ type: 'update', state }));
        });
    }

    sendInvalidMove(player) {
        // Send invalid move notification to the client
    }
}

module.exports = WebSocketServer;

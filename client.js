var ws = require('websocket');
var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();

function initialize() {

}


start();

function start() {
    client.on('connectFailed', function (error) {
        console.log('Connect Error: ' + error.toString());
    });

    client.on('connect', function (connection) {
        console.log('WebSocket Client Connected');

        var inp = process.openStdin();
        inp.addListener('data', (d) => {
            connection.sendUTF(d);
        });

        connection.on('message', function (message) {
            if (message.type === 'utf8') {
                console.log(message.utf8Data);
            }
        });

        connection.on('error', function (error) {
            console.log("Connection Error: " + error.toString());
        });
        connection.on('close', function () {
            console.log('Disconnected from Leibniz.');
            process.exit();
        });
    });

    client.connect('ws://localhost:9669/', 'echo-protocol', JSON.stringify({ "username": "testuser", "key": 'newuser' }));
}


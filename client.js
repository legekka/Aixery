var ws = require('websocket');
var fs = require('fs');
var c = require('chalk');
var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();

function AIcl(text) {
    console.log(c.red('[Aixery] ') + text);
}
function YRcl(text) {
    console.log(c.cyan('[Yrexia] ' + text));
}
var inp;
var complete = false;
var username;
var key;

//var serverip = 'ws://localhost:9669/';
var serverip = 'ws://leibniz.cf:9669/';

function initialize() {
    if (!fs.existsSync('./clientinfo.txt')) {
        AIcl("No clientinfo.txt found. Let's create a new one.");
        inp = process.openStdin();
        process.stdout.write("Enter a nickname: ");
        inp.addListener('data', usernamelistener);
        var waiter = setInterval(() => {
            if (complete) {
                clearInterval(waiter);
                firstConnect();
            }
        }, 1000)
    } else {
        var data = JSON.parse(fs.readFileSync('./clientinfo.txt'));
        username = data.username;
        key = data.key;
        start();
    }
}

function usernamelistener(d) {
    username = d.toString().trim().split(' ')[0];
    console.log('Your username will be "' + username + '".');
    inp.removeListener('data', usernamelistener);
    AIcl(`Welcome ${username}! At your first connection gekky's Yrexia server will send to you your login key.`);
    AIcl("I will save it into your clientinfo.txt.");
    AIcl("Okay. Let's do this.");
    complete = true;
}


function firstConnect() {
    client.on('connectFailed', function (error) {
        AIcl('Connect Error: ' + error.toString());
    });

    client.on('connect', function (connection) {
        AIcl('WebSocket Client Connected');

        connection.on('message', function (message) {
            if (message.type === 'utf8') {
                YRcl(message.utf8Data);
                if (message.utf8Data.indexOf('Your key is:') >= 0) {
                    key = message.utf8Data.toString().split(':')[1].trim();
                    AIcl("Gotcha! " + key);
                    fs.writeFileSync('./clientinfo.txt', JSON.stringify({
                        'username': username,
                        'key': key
                    }));
                    connection.close();
                    AIcl("Nice. Data saved.");
                    setTimeout(() => { process.exit(); }, 1000);
                }
            }
        });

        connection.on('error', function (error) {
            YRcl("Connection Error: " + error.toString());
        });

        connection.on('close', function () {
            AIcl('Disconnected from Leibniz.');
            process.exit();
        });
    });

    client.connect(serverip, 'echo-protocol', JSON.stringify({ "username": username, "key": "newuser" }));

}


//start();
initialize();



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

    client.connect(serverip, 'echo-protocol', JSON.stringify({ "username": "testuser", "key": "649RPYYX" }));
}


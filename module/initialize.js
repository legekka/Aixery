// initialization
var ws = require('websocket');
var fs = require('fs');
var c = require('chalk');
var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();
var inp;
var complete = false;
var username;
var key;

var serverip = 'ws://boltzmann.cf:9669/';

module.exports = (callback) => {
    if (!fs.existsSync('./clientinfo.txt')) {
        AIcl("No clientinfo.txt found. Let's create a new one.");
        inp = process.openStdin();
        process.stdout.write("Enter a nickname: ");
        inp.addListener('data', usernamelistener);
        var waiter = setInterval(() => {
            if (complete) {
                clearInterval(waiter);
                firstConnect(() => {
                    return callback({ "username": username, "key": key })
                });
            }
        }, 1000)
    } else {
        var data = JSON.parse(fs.readFileSync('./clientinfo.txt'));
        username = data.username;
        key = data.key;
        return callback({ "username": username, "key": key })
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

function firstConnect(callback) {
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
                    return callback()
                }
            }
        });

        connection.on('error', function (error) {
            YRcl("Connection Error: " + error.toString());
        });

        connection.on('close', function () {
            AIcl('Disconnected from Leibniz.');
        });
    });

    client.connect(serverip, 'echo-protocol', JSON.stringify({ "username": username, "key": "newuser" }));

}

function YRpref() {
    return c.cyan('[YR] ') + reqreload('./getTime.js')('full') + ' ';
}
function AIcl(text) {
    console.log(c.red('[Aixery] ') + text);
}
function YRcl(text) {
    console.log(c.cyan('[Yrexia] ' + text));
}
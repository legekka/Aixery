var ws = require('websocket');
var fs = require('fs');
var c = require('chalk');
var WebSocketClient = require('websocket').client;
var reqreload = require('./module/reqreload.js');
var client = new WebSocketClient();

var serverip = 'ws://boltzmann.cf:9669/';
var pingStart;

require('./module/initialize.js')((response) => {
    var connected = false;
    var autoconnect = setInterval(() => {
        if (!connected) {
            client.connect(serverip, 'echo-protocol', JSON.stringify({ "username": response.username, "key": response.key }));
        }
    }, 5000);
    client.on('connectFailed', function (error) {
        console.log('Connect Error: ' + error.toString());
    });

    client.on('connect', function (connection) {
        connected = true;
        console.log('WebSocket Client Connected');
        var inp = process.openStdin();
        inp.addListener('data', (d) => {
            var txt = d.toString().trim();
            if (txt.startsWith('!')) {
                if (txt == '!userlist') {
                    connection.sendUTF(commandOBJ(txt.substr(1)));
                } else if (txt == '!ping') {
                    pingStart = parseDate(new Date());
                    connection.sendUTF(commandOBJ(txt.substr(1)));
                } else if (txt == '!exit' || txt == '!close' || txt == '!quit') {
                    AIcl('Closing connection...');
                    clearInterval(autoconnect);
                    connection.close();
                    process.exit();
                }
            } else if (txt.startsWith('_')) {
                var content = txt.substr(1).split(' ');
                connection.sendUTF(messagev2OBJ(content));
            } else {
                connection.sendUTF(messageOBJ(txt));
            }
        });
        connection.on('message', function (message) {
            if (message.type === 'utf8') {
                parseMessage(message);
            }
        });
        connection.on('error', function (error) {
            console.log("Connection Error: " + error.toString());
        });
        connection.on('close', function () {
            console.log('Disconnected from Yrexia.');
            connected = false;
        });
    });
    client.connect(serverip, 'echo-protocol', JSON.stringify({ "username": response.username, "key": response.key }));
})

function parseMessage(message, connection) {
    var msg = JSON.parse(message.utf8Data.toString().trim());
    if (msg.type == 'message') {
        if (msg.username == 'Yrexia') {
            console.log(YRpref() + `${msg.content}`);
        } else {
            console.log(YRpref() + `${msg.username}: ${msg.content}`);
        }
    } else if (msg.type == 'messagev2') {
        process.stdout.write(YRpref() + `${msg.username}: `);
        for (i in msg.content) {
            process.stdout.write(msg.content[i] + ' ');
        }
        process.stdout.write('\n');
    } else if (msg.type == 'command') {
        parseCommand(msg);
    } else if (msg.type == 'file') {
        parseFile(msg);
    } else if (msg.type == 'convert') {
        parseConvert(msg, connection);
    }
}

function parseConvert(msg, connection) {
    if (msg.username == 'Yrexia') {
        YRcl('Convert requested: ' + msg.url);
        require('./module/convert.js').convert(msg.url, (link) => {
            connection.sendUTF(JSON.stringify({
                'username': username,
                'type': 'convert',
                'url': link,
                'channel_id': msg.channel_id,
                'color': msg.color,
                'original_url': msg.url
            }))
        });
    }
}

function parseCommand(msg) {
    if (msg.username == 'Yrexia') {
        if (msg.command == 'pingEnd') {
            var pingEnd = parseDate(new Date());
            AIcl(`The ping is: ${(pingEnd - pingStart)} ms`);
        }
    }
}

function parseFile(msg) {

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
function messageOBJ(data) {
    return JSON.stringify({
        'username': username,
        'content': data,
        'type': 'message',
    });
}
function messagev2OBJ(data) {
    return JSON.stringify({
        'username': username,
        'content': data,
        'type': 'messagev2',
    });
}
function commandOBJ(data) {
    return JSON.stringify({
        'username': username,
        'type': 'command',
        'command': data
    });
}
function parseDate(date) {
    return date.getMilliseconds() + date.getSeconds() * 1000 + date.getMinutes() * 60000 + date.getHours() * 3600000 + date.getDate() * 86400000;
}
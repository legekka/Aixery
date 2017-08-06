var ws = require('websocket');
var fs = require('fs');
var c = require('chalk');
var WebSocketClient = require('websocket').client;
var reqreload = require('./module/reqreload.js');
var client = new WebSocketClient();

function YRpref() {
    return c.cyan('[YR] ') + reqreload('./getTime.js')('full') + ' ';
}
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

var pingStart;
function parseDate(date) {
    return date.getMilliseconds() + date.getSeconds() * 1000 + date.getMinutes() * 60000 + date.getHours() * 3600000 + date.getDate() * 86400000;
}

function start() {
    client.on('connectFailed', function (error) {
        console.log('Connect Error: ' + error.toString());
    });

    client.on('connect', function (connection) {
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
                } else if (txt == '!teszt5000') {
                    var content = fs.readFileSync('./teszt5000.txt').toString().split(' ');
                    for (i in content) {
                        content[i] = content[i].trim();
                    }
                    connection.sendUTF(messagev2OBJ(content));
                } else if (txt == '!teszt10k') {
                    var content = fs.readFileSync('./teszt10k.txt').toString().split(' ');
                    for (i in content) {
                        content[i] = content[i].trim();
                    }
                    connection.sendUTF(messagev2OBJ(content));
                } else if (txt == '!teszt100kv1') {
                    var str = fs.readFileSync('./teszt100k.txt').toString();
                    connection.sendUTF(messageOBJ(content));
                } else if (txt == '!teszt100kv2') {
                    var content = fs.readFileSync('./teszt100k.txt').toString().split(' ');
                    for (i in content) {
                        content[i] = content[i].trim();
                    }
                    connection.sendUTF(messagev2OBJ(content));
                } else if (txt == '!exit' || txt == '!close' || txt == '!quit') {
                    //AIcl('Closing connection...');
                    connection.close();
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
                //console.log(message.utf8Data);
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

    client.connect(serverip, 'echo-protocol', JSON.stringify({ "username": username, "key": key }));
}

function parseMessage(message) {
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
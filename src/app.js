var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var storage = require('./memory-storage.js');

app.use('/', express.static(__dirname + '/client'));

io.on('connection', (socket) => {
    console.log(`A new user connected. (ID=${socket.id})`);

    socket.on('user', data => {
        var user = {
            socket: socket.id
        };
        storage.createUser(data.id, user);
        console.log(`User ${data.id} is connected. (ID=${socket.id})`);
    });

    socket.on('create', (data, callback) => {
        var game = {
            type: data.type
        };
        var id = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        storage.createGame(id, game);
        console.log(`A new game created. (ID=${id})`);
        callback({ id });
        var userID = storage.findUser(user => user.socket == socket.id);
        if (userID) {
            socket.broadcast.emit('cue-request', { id: userID });
        }
    });

    socket.on('cue', data => {
        var user = storage.getUser(data.id);
        if (user) {
            io.to(user.socket).emit('cue');
        }
    });

    socket.on('control', data => {
        var user = storage.getUser(data.id);
        if (user) {
            io.to(user.socket).emit('control', data);
        }
    });
});

http.listen(process.env.PORT, () => {
    console.log('listening on *:'+process.env.PORT);
});

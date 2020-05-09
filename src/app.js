var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var storage = require('./memory-storage.js');

app.use('/', express.static(__dirname + '/client'));

io.on('connection', (socket) => {
    console.log(`A new socket connected. (ID=${socket.id})`);

    socket.on('user', data => {
        var user = {
            socket: socket.id
        };
        storage.createUser(data.id, user);
        console.log(`User ${data.id} is connected. (ID=${socket.id})`);
    });

    socket.on('create', (data, callback) => {
        var userID = storage.findUser(user => user.socket == socket.id);
        if (userID) {
            var game = {
                type: data.type,
                players: [userID]
            };
            var id = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            storage.deletePlayerFromGames(userID);
            storage.createGame(id, game);
            socket.join(id);
            console.log(`A new game created by user ${userID}. (ID=${id})`);
            callback({ id });
            socket.broadcast.emit('cue-request', { id: userID });
        }
    });

    socket.on('join', (data, callback) => {
        var userID = storage.findUser(user => user.socket == socket.id);
        if (userID) {
            var game = storage.getGame(data.id);
            if (game) {
                storage.deletePlayerFromGames(userID);
                storage.updateGame(data.id, game => game.players.push(userID));
                socket.join(data.id);
                console.log(`User ${userID} joind game ${data.id}.`);
                callback(game);
                socket.broadcast.emit('cue-request', { id: userID });
            } else {
                callback({ error: `Game ${data.id} not found.` });
            }
        }
    });

    socket.on('cue', data => {
        var user = storage.getUser(data.id);
        if (user) {
            io.to(user.socket).emit('cue');
        }
    });

    socket.on('control', data => {
        var game = storage.findGame(game => game.players.includes(data.id));
        if (game) {
            io.to(game).volatile.emit('control', data);
        }

    });

    socket.on('request-sync', data => {
        var game = storage.getGame(data.id);
        if (game && game.players.length) {
            var user = storage.getUser(game.players[0]);
            io.to(user.socket).emit('request-sync');
        }
    });

    socket.on('sync', data => {
        socket.to(data.id).emit('sync', data);
    });

    socket.on('disconnect', reason => {
        console.log(`Socket is disconnected. (ID=${socket.id})`);
    });
});

var port = process.env.PORT || 147;

http.listen(port, () => {
    console.log('listening on *:' + port);
});

var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var storage = require('./memory-storage.js');

app.use('/', express.static(__dirname + '/client'));

io.on('connection', (socket) => {
    console.log(`A new user connected. (ID=${socket.id})`);

    socket.on('create', data => {
        var game = {
            type: data.type,
            players: [
                {  id: socket.id }
            ]
        };
        var id = storage.createGame(game);
        console.log(`A new game created. (ID=${id})`);
        socket.emit('created', { id });
    });
});

http.listen(process.env.PORT, () => {
    console.log('listening on *:'+process.env.PORT);
});

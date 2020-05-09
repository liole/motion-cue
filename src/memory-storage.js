var data = {
    games: {},
    users: {}
};

var service = {
    getGame(id) {
        return data.games[id];
    },
    findGame(predicate) {
        return Object.keys(data.games).find(id => predicate(data.games[id]));
    },
    createGame(id, game) {
        data.games[id] = game;
    },
    updateGame(id, callback) {
        callback(data.games[id]);
    },
    deleteGame(id) {
        data.games[id] = undefined;
    },
    deletePlayerFromGames(id) {
        for(var gameID in data.games) {
            var game = data.games[gameID];
            game.players = game.players.filter(p => p != id)
        }
    },

    getUser(id) {
        return data.users[id];
    },
    findUser(predicate) {
        return Object.keys(data.users).find(id => predicate(data.users[id]));
    },
    createUser(id, user) {
        data.users[id] = user;
    },
    updateUser(id, callback) {
        callback(data.users[id]);
    },
    deleteUser(id) {
        data.users[id] = undefined;
    },
};  

module.exports = service;

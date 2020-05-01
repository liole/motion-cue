var data = {
    games: {}
};

var service = {
    getGame(id) {
        return data.games[id];
    },
    createGame(id, game) {
        data.games[id] = game;
    },
    updateGame(id, callback) {
        callback(data.games[id]);
    },
    deleteGame(id) {
        data.games[id] = undefined;
    }
};  

module.exports = service;

var data = {
    games: {}
};

var service = {
    getGame(id) {
        return data.games[id];
    },
    createGame(game) {
        var id = newGuid();
        data.games[id] = game;
        return id;
    },
    updateGame(id, callback) {
        callback(data.games[id]);
    },
    deleteGame(id) {
        data.games[id] = undefined;
    }
};

function newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
  

module.exports = service;

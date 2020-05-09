var data = {
    games: {},
    users: {}
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

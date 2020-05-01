import dom from '/dom.js';
import { Game, games } from '/game.js';

var socket = io();
var game = undefined;
var frame = undefined;

dom('#init-create').on('click', e => {
    var container = dom('#type');
    container.clear();

    for (let game of games) {
        let button = dom.new('button', {
            className: 'main',
            innerText: game.type.toUpperCase()
        });
        button.on('click', e => createGame(game.type));
        container.append(button)
    }

    dom('body').className = 'type';
});

dom('#init-join').on('click', e => {
    dom('body').className = 'join';
    dom('#join-id').focus();
});

function createGame(type) {
    socket.emit('create', { type }, ({ id }) => {
        game = Game[type];
        game.id = id;
        render();
        dom('body').className = 'game';
    });
}

function render() {
    if (!frame) {
        frame = requestAnimationFrame(timestamp => {
            game.render();
        })
    }
}

socket.on('connect', () => {
    console.log(socket.id);
});

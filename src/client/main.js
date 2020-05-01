import dom from '/dom.js';
import { Game, games } from '/game.js';

var socket = io();
var game = undefined;

dom('#init-create').on('click', e => {
    var container = dom('#type');
    container.clear();

    for (let game of games) {
        let button = dom.new('button', {
            className: 'main',
            innerText: game.type.toUpperCase()
        });
        button.on('click', e => createGame(game.type));
        container.append(button);
    }

    dom('body').className = 'type';
});

dom('#init-join').on('click', e => {
    dom('body').className = 'join';
    dom('#join-id').focus();
});

socket.on('cue', () => dom('#connect-box').hide());

socket.on('control', event => {
    game.handle(event);
});

function createGame(type) {
    socket.emit('create', { type }, ({ id }) => {
        startGame(type, id);
    });
}

function startGame(type, id) {
    document.body.requestFullscreen();
    game = Game[type];
    game.id = id;
    game.render();
    dom('body').className = 'game';
    showConnectBox();
}

async function showConnectBox() {
    var elem = await QRCode.toCanvas(dom('#cue-qr'),
        `${location.origin}/cue/#${socket.id}`,
        { scale: 15, margin: 3 });

    elem.css({
        width: '300px',
        height: '300px'
    });

    dom('#connect-box').show();
}

socket.on('connect', () => {
    console.log(socket.id);
});

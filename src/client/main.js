import dom from './dom.js';
import { Game, games } from './game.js';
import { Settings } from './settings.js';

var socket = io();
var game = undefined;
var userID = localStorage.userID || (localStorage.userID = Math.random().toString(36).substr(2));

dom('#init-create').on('click', e => {
    var container = dom('#type');
    container.clear();

    for (let game of games) {
        let button = dom.new('button', {
            className: 'main',
            innerText: game.type.toUpperCase().replace('_', ' ')
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

dom('#join-id').on('keyup', e => {
    if (dom('#join-id').value.length == 4) {
        joinGame(dom('#join-id').value);
    }
});

dom('#add-player').on('click', addSecondaryPlayer);

dom('#full-screen').on('click', e => document.fullscreenElement
    ? document.exitFullscreen()
    : document.body.requestFullscreen());

dom('#settings').on('click', e => dom('#settings-panel').classList.add('show'));
dom('#close-settings').on('click', e => dom('#settings-panel').classList.remove('show'));
document.addEventListener('click', e=> {
    if (!dom('#settings-panel').contains(e.target) && !dom('#settings').contains(e.target)) {
        dom('#settings-panel').classList.remove('show')
    }
});

socket.on('cue', () => dom('#connect-box').hide());

socket.on('control', event => {
    game.handle(event);
});

socket.on('request-sync', () => {
    game.pushSync();
});

socket.on('sync', state => {
    game.setSyncState(state);
});

socket.on('new-player', player => {
    game.controller.addPlayer({
        type: 'remote',
        id: player.id,
        active: false
    });
})

window.addEventListener('fullscreenchange', e => {
    var icon = dom('#full-screen i');
    icon.classList.remove('fa-compress');
    icon.classList.remove('fa-expand');
    icon.classList.add(document.fullscreenElement ? 'fa-compress' : 'fa-expand');
});

var spaceStart = undefined;
window.addEventListener('keydown', e => {
    if (e.key == ' ' && game && !spaceStart) {
        spaceStart = Date.now();
    }
})

window.addEventListener('keyup', e => {
    if (game) {
        if (e.key == 't') {
            settings.trace = !settings.trace;
        }
        if (e.key == 'h') {
            game.cueBall.inHand = true;
            game.pushSync();
            game.queueRender();
        }
        if (e.key == 'a') {
            settings.aim = !settings.aim;
        }
        if (e.key == 'p') {
            settings.predict = !settings.predict;
        }
        if (e.key >= '0' && e.key <= '9') {
            let x = +e.key;
            let min = game.cueBall.radius / game.table.pockets.radius;
            let max = 2;
            let k = 1;
            if (x < 5) {
                k = min + (1 - min) * x/5;
            }
            if (x > 5) {
                k = 1 + (max - 1) * (x - 5) / 4;
            }
            settings.pocket = k + Number.EPSILON;
        }
        if (e.key == ' ' && spaceStart) {
            var duration = Date.now() - spaceStart;
            console.log(duration, Math.min(duration / 30, 100));
            game.handle({
                type: 'shot',
                id: userID,
                acceleration: Math.min(duration / 30, 75)
            });
            spaceStart = undefined;
        }
    }
})

function createGame(type) {
    socket.emit('create', { type }, ({ id }) => {
        startGame(type, id);
    });
}

function joinGame(id) {
    socket.emit('join', { id }, ({ type, error }) => {
        if (type) {
            startGame(type, id);
            socket.emit('request-sync', { id });
        } else if (error) {
            $alert(error);
        }
    });
}

function addSecondaryPlayer() {
    socket.emit('join', {
        id: game.id,
        secondary: true
    }, () => {
        game.controller.addPlayer({ active: false });
    });
}

function startGame(type, id) {
    document.body.requestFullscreen();
    game = Game[type];
    game.id = id;
    game.userID = userID;
    game.controller.addPlayer();
    game.pushSync = () => socket.emit('sync', game.getSyncState());
    game.render();
    dom('#game-id').innerText = id;
    window.settings = new Settings(game);
    dom('body').className = 'game';
    showConnectBox();
    window.game = game;
    // bug in chrome prevents font rendering: https://bugs.chromium.org/p/chromium/issues/detail?id=336476
    // temporary workaround
    dom('.bottom-bar.right').hide();
    setTimeout(() => dom('.bottom-bar.right').show(), 100);
}

async function showConnectBox() {
    var elem = await QRCode.toCanvas(dom('#cue-qr'),
        `${location.origin}/cue/#${userID}`,
        { scale: 15, margin: 3 });

    elem.css({
        width: '300px',
        height: '300px'
    });

    dom('#connect-box').show();
}

socket.on('connect', () => {
    console.log(socket.id);
    socket.emit('user', { id: userID });
});

window.$alert = function (text, timeout = 3000) {
    var alert = dom('#alert');
    alert.innerText = text;
    alert.classList.add('show');
    if (window.$alertTimer) {
        clearTimeout(window.$alertTimer);
    }
    window.$alertTimer = setTimeout(() => {
        alert.classList.remove('show');
        window.$alertTimer = undefined;
    }, timeout);
}
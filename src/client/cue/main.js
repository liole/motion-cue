var socket = io();

var init = false;

socket.on('connect', function() {
    socket.emit('cue', { id: getID() });
});

document.addEventListener('DOMContentLoaded', function() {

    document.getElementById('cue').addEventListener('touchstart', function(e) {
        init = true;
        window.addEventListener('deviceorientation', sendCue);
    });
    document.getElementById('cue').addEventListener('touchend', function(e) {
        window.removeEventListener('deviceorientation', sendCue);
        init = null;
        sendCue({});
    });
        
    document.getElementById('ball').addEventListener('touchstart', function(e) {
        init = true;
        window.addEventListener('deviceorientation', sendBall);
    });
    document.getElementById('ball').addEventListener('touchend', function(e) {
        window.removeEventListener('deviceorientation', sendBall);
        init = null;
        sendBall({});
    });

});



function sendCue(e) {
    socket.emit('control', getMessage(e, 'cue'));
    init = false;
}

function sendBall(e) {
    socket.emit('control', getMessage(e, 'ball'));
    init = false;
}

function getMessage(event, type) {
    return {
        id: getID(),
        type: type,
        init: init,
        alpha: rad(event.alpha),
        beta: rad(event.beta),
        gamma: rad(event.gamma)
    };
}

function getID() {
    return location.hash.substr(1);
}

function rad(deg) {
    return deg / 180 * Math.PI;
}

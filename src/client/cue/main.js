var socket = io();

var init = false;

document.getElementById('cue').addEventListener('touchstart', function(e) {
    init = true;
    window.addEventListener('deviceorientation', sendCue);
});
document.getElementById('cue').addEventListener('touchend', function(e) {
    window.removeEventListener('deviceorientation', sendCue);
});
    
document.getElementById('ball').addEventListener('touchstart', function(e) {
    init = true;
    window.addEventListener('deviceorientation', sendBall);
});
document.getElementById('ball').addEventListener('touchend', function(e) {
    window.removeEventListener('deviceorientation', sendBall);
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
    var id = location.hash.substr(1);
    return {
        id: id,
        type: type,
        init: init,
        alpha: rad(event.alpha),
        beta: rad(event.beta),
        gamma: rad(event.gamma)
    };
}

function rad(deg) {
    return deg / 180 * Math.PI;
}

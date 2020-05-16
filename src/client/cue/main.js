var socket = io();

var init = false;
var timer = undefined;
var maxAcceleration = 0;
var criticalAcceleration = 8;
var shotTimeout = 500;

var haveMotion = false;

socket.on('connect', sendInit);
socket.on('cue-request', sendInit);

document.addEventListener('DOMContentLoaded', function() {

    document.getElementById('cue').addEventListener('touchstart', function(e) {
        init = true;
        window.addEventListener('deviceorientation', sendCue);
        e.target.className = 'active';
    });
    document.getElementById('cue').addEventListener('touchend', function(e) {
        window.removeEventListener('deviceorientation', sendCue);
        init = null;
        sendCue({});
        e.target.className = '';
    });
        
    document.getElementById('ball').addEventListener('touchstart', function(e) {
        init = true;
        window.addEventListener('deviceorientation', sendBall);
        e.target.className = 'active';
    });
    document.getElementById('ball').addEventListener('touchend', function(e) {
        window.removeEventListener('deviceorientation', sendBall);
        init = null;
        sendBall({});
        e.target.className = '';
    });

    window.addEventListener('devicemotion', trackMotion);

    setTimeout(checkMotion, shotTimeout);
});

function checkMotion() {
    if (!haveMotion) {
        var banner = document.getElementById("permissions");
        banner.className = "show";
        banner.onclick = function() {
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission().then(function(stateOrientation) {
                    if (stateOrientation == "granted") {
                        if (typeof DeviceMotionEvent.requestPermission === 'function') {
                            DeviceMotionEvent.requestPermission().then(function(stateMotion) {
                                if (stateMotion == "granted") {
                                    banner.className = "";
                                }
                            });
                        }
                    }
                });
            }
        }
    }
}

function trackMotion(e) {
    haveMotion = true;
    if (e.acceleration.y > maxAcceleration) {
        maxAcceleration = e.acceleration.y;
    }
    if (e.acceleration.y > criticalAcceleration && !timer) {
        timer = this.setTimeout(sendShot, shotTimeout);
    }
}

function sendInit() {
    socket.emit('cue', { id: getID() });
}

function sendCue(e) {
    socket.emit('control', getMessage(e, 'cue'));
    init = false;
}

function sendBall(e) {
    socket.emit('control', getMessage(e, 'ball'));
    init = false;
}

function sendShot() {
    socket.emit('control', {
        id: getID(),
        type: 'shot',
        acceleration: maxAcceleration
    });
    maxAcceleration = 0;
    timer = undefined;
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

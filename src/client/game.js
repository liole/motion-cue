import { Cue } from './objects/cue.js';
import { Table } from './objects/table.js';
import { Ball, collide } from './objects/ball.js';
import dom from './dom.js';
import { SpinControl } from './spin-control.js';
import { distPolygon, mirror } from './utils.js';

export class Game {

    constructor(type, table, cue, balls) {
        this.type = type;
        this.table = table;
        this.cue = cue;
        this.balls = balls;
        this.spinControl = SpinControl.default;

        this.table.resetBalls(this.balls);
        this.aimCue(Math.PI / 4);
    }

    get cueBall() {
        return this.balls[0];
    }

    aimCue(angle) {
        this.cue.aim(this.cueBall.x, this.cueBall.y, angle, this.cueBall.radius * 2);
    }

    handle(event) {
        if (event.init) {
            this.initControl(event);
            if (event.type == 'ball') {
                dom('#spin-view-box').classList.add('focus');
            }
        }
        if (event.init == null) {
            if (event.type == 'ball') {
                dom('#spin-view-box').classList.remove('focus');
            }
            return;
        }
        switch (event.type) {
            case 'cue':
                var angle = this.init.cue.angle + event.alpha - this.init.angle.alpha;
                this.aimCue(angle);
                break;
            case 'ball':
                var x = this.init.ball.pos.x + Math.tan(this.init.angle.alpha - event.alpha) * 2;
                var y = this.init.ball.pos.y + Math.tan(event.beta - this.init.angle.beta) * 2;
                this.spinControl.aim(x, y);
        }
        this.queueRender();
    }

    initControl(event) {
        this.init = {
            angle: {
                alpha: event.alpha,
                beta: event.beta,
                gamma: event.gamma
            },
            cue: {
                angle: this.cue.angle
            },
            ball: {
                pos: this.spinControl.toXY()
            }
        };
    }

    simulate(dt) {
        var needRender = false;
        for (let ball of this.balls) {
            if (ball.isMoving) {
                let data = ball.simulate(dt);
                let distTable = distPolygon(this.table.points, data);
                if (distTable[0] < ball.radius) {
                    var fakeBall = mirror(distTable[1], distTable[2], ball);
                    collide(ball, fakeBall);
                    data = ball.simulate(dt);
                }
                ball.move(dt, data);
                needRender = true;
            }
        }
        return needRender;
    }

    render() {
        var board = dom('#board');
        this.table.render(board);
        this.balls.forEach(b => b.render(board));
        this.cue.render(board);
        this.spinControl.render(dom('#spin-view'));
    }
    
    queueRender() {
        if (!this.frame) {
            this.frame = requestAnimationFrame(timestamp => {
                this.render();
                this.frame = undefined;
                if (this.simulate((timestamp - (this.timestamp || timestamp))/1000)) {
                    this.queueRender();
                }
                this.timestamp = timestamp;
            })
        }
    }

}

Game.test = new Game('test', Table.snooker, Cue.default, Ball.snookerAll);

export var games = [
    Game.test
];

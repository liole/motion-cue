import { Cue } from './objects/cue.js';
import { Table } from './objects/table.js';
import { Ball } from './objects/ball.js';
import { collide } from './physics.js';
import dom from './dom.js';
import { SpinControl } from './spin-control.js';
import { distPolygon, mirror, dist, sqr, shift, mult, isInside } from './utils.js';
import { DefaultController } from './controllers/default.js';

const syncInverval = 1000;

export class Game {

    constructor(type, table, cue, balls, controller) {
        this.type = type;
        this.table = table;
        this.cue = cue;
        this.balls = balls;
        this.controller = controller.attach(this);
        this.spinControl = SpinControl.default;
        this.trace = false;
        this.owner = false;

        this.table.resetBalls(this.balls);
        this.aimCue(Math.PI / 4);
        this.cueBall.inHand = true;
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
            if (event.type == 'ball' && !this.cueBall.inHand) {
                dom('#spin-view-box').classList.add('focus');
            }
        }
        if (event.init === null) {
            if (event.type == 'ball' && !this.cueBall.inHand) {
                dom('#spin-view-box').classList.remove('focus');
            }
            return;
        }
        this.triggerTrace(this.trace);
        switch (event.type) {
            case 'cue':
                this.cueBall.inHand = false;
                let angle = this.init.cue.angle + event.alpha - this.init.angle.alpha;
                this.aimCue(angle);
                break;
            case 'ball':
                let x = this.init.ball.spin.x + Math.tan(this.init.angle.alpha - event.alpha) * 2;
                let y = this.init.ball.spin.y + Math.tan(event.beta - this.init.angle.beta) * 2;
                if (this.cueBall.inHand) {
                    this.cueBall.x = this.init.ball.pos.x + x * 15;
                    this.cueBall.y = this.init.ball.pos.y - y * 15;
                } else {
                    this.spinControl.aim(x, y);
                }
                break;
            case 'shot':
                this.owner = event.id == this.userID;
                let energy = 10 * sqr(event.acceleration);
                let k = Math.sqrt(5 * energy) / (3 * this.cueBall.radius);
                let u = 25 / (2 * Math.sqrt(6));
                let totalSpin = k * this.spinControl.dist * ( (5 - u) * this.spinControl.dist + u - 2 );
                let planeSpin = mult(this.spinControl.toXY(), totalSpin == 0 ? 0 : totalSpin / this.spinControl.dist);
                let totalSpeed = Math.sqrt(Math.abs(energy - (1/5) * sqr(totalSpin * this.cueBall.radius)));
                let ballAngle = this.cue.angle + Math.PI;
                this.cueBall.velocity = shift({ x: 0, y: 0}, ballAngle, totalSpeed);
                this.cueBall.spin = shift({ x: 0, y: 0}, ballAngle, planeSpin.y);
                this.cueBall.spin.z = planeSpin.x;
                this.timestamp = undefined;
                this.spinControl.reset();
                console.log(energy, this.cueBall.velocity, this.cueBall.spin);
                break;
        }
        this.queueRender();
    }

    triggerTrace(trace = !this.trace) {
        this.trace = trace;
        for (let ball of this.balls) {
            ball.setTrace(this.trace);
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
                spin: this.spinControl.toXY(),
                pos: {
                    x: this.cueBall.x,
                    y: this.cueBall.y
                }
            }
        };
    }

    simulate(dt) {
        let simBalls = this.balls.map(b => b.isMoving ? b.simulate(dt) : b);

        for (let i = 0; i < this.balls.length; ++i) {
            let ball = this.balls[i];
            if (!ball.active || ball.inHand) continue;

            if (true /* bal.isMoving */ ) { // somehow can not split the triangle with this
                for (let pocket of this.table.pockets.points) {
                    let distPocket = dist(pocket, simBalls[i]);
                    if (distPocket < this.table.pockets.radius) {
                        ball.pot();
                        this.controller.handle('pot', { ball });
                        continue;
                    }
                }
                let distTable = distPolygon(this.table.points, simBalls[i]);
                if (distTable[0] < ball.radius) {
                    let fakeBall = mirror(distTable[1], distTable[2], ball);
                    collide(ball, fakeBall);
                    this.controller.handle('cushion', { ball });
                    simBalls[i] = ball.simulate(dt);
                }
                for (let j = i+1; j < this.balls.length; ++j) {
                    let otherBall = this.balls[j];
                    if (!otherBall.active || (!ball.isMoving && !otherBall.isMoving)) continue;

                    let distBall = dist(simBalls[j], simBalls[i]);
                    if (distBall < ball.radius + otherBall.radius) {
                        collide(ball, otherBall);
                        this.controller.handle('collision', { balls: [ball, otherBall] });
                        simBalls[i] = ball.simulate(dt);
                        simBalls[j] = otherBall.simulate(dt);
                    }
                }
            }
        }

        for (let i = 0; i < this.balls.length; ++i) {
            let ball = this.balls[i];
            if (ball.isMoving) {
                ball.move(dt, simBalls[i]);
            }
            if (!isInside(this.table.points, ball) && ball.isMoving) {
                this.controller.handle('out', { ball });
                ball.stop();
            }
        }

        return this.balls.some(b => b.isMoving);
    }

    getSyncState() {
        return {
            id: this.id,
            balls: this.balls.map(ball => ({
                x: ball.x,
                y: ball.y,
                velocity: ball.velocity,
                spin: ball.spin,
                active: ball.active,
                inHand: ball.inHand
            })),
            cue: {
                x: this.cue.x,
                y: this.cue.y,
                angle: this.cue.angle,
                tilt: this.cue.tilt
            },
            spinControl: {
                angle: this.spinControl.angle,
                dist: this.spinControl.dist
            }
        };
    }

    setSyncState(state) {
        for (let i = 0; i < state.balls.length; ++i) {
            Object.assign(this.balls[i], state.balls[i]);
        }
        Object.assign(this.cue, state.cue);
        Object.assign(this.spinControl, state.spinControl);
        this.queueRender();
    }

    render() {
        let board = dom('#board');
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
                    if (this.owner && (timestamp - (this.syncTimestamp || 0) > syncInverval)) {
                        this.pushSync();
                        this.syncTimestamp = timestamp;
                    }
                } else if (this.owner) {
                    this.controller.handle('stop');
                    this.pushSync();
                    this.owner = false;
                    this.queueRender();
                }
                this.timestamp = timestamp;
            })
        }
    }

}

Game.snooker = new Game('snooker', Table.snooker, Cue.snooker, Ball.snookerAll, new DefaultController());
Game.pool = new Game('pool', Table.pool, Cue.pool, Ball.poolAll, new DefaultController());

export var games = [
    Game.snooker,
    Game.pool
];

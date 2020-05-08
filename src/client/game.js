import { Cue } from './objects/cue.js';
import { Table } from './objects/table.js';
import { Ball, collide } from './objects/ball.js';
import dom from './dom.js';
import { SpinControl } from './spin-control.js';
import { distPolygon, mirror, dist, sqr, shift, mult } from './utils.js';

export class Game {

    constructor(type, table, cue, balls) {
        this.type = type;
        this.table = table;
        this.cue = cue;
        this.balls = balls;
        this.spinControl = SpinControl.default;
        this.trace = false;

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
                let x = this.init.spinBall.pos.x + Math.tan(this.init.angle.alpha - event.alpha) * 2;
                let y = this.init.spinBall.pos.y + Math.tan(event.beta - this.init.angle.beta) * 2;
                if (this.cueBall.inHand) {
                    this.cueBall.x = this.init.cueBall.pos.x + x * 25;
                    this.cueBall.y = this.init.cueBall.pos.y - y * 25;
                } else {
                    this.spinControl.aim(x, y);
                }
                break;
            case 'shot':
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
            spinBall: {
                pos: this.spinControl.toXY()
            },
            cueBall: {
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
            if (!ball.active) continue;

            if (true /* bal.isMoving */ ) { // somehow can not split the triangle with this
                for (let pocket of this.table.pockets.points) {
                    let distPocket = dist(pocket, simBalls[i]);
                    if (distPocket < this.table.pockets.radius) {
                        ball.pot();
                        continue;
                    }
                }
                let distTable = distPolygon(this.table.points, simBalls[i]);
                if (distTable[0] < ball.radius) {
                    let fakeBall = mirror(distTable[1], distTable[2], ball);
                    collide(ball, fakeBall);
                    simBalls[i] = ball.simulate(dt);
                }
                for (let j = i+1; j < this.balls.length; ++j) {
                    let otherBall = this.balls[j];
                    if (!otherBall.active || (!ball.isMoving && !otherBall.isMoving)) continue;

                    let distBall = dist(simBalls[j], simBalls[i]);
                    if (distBall < ball.radius + otherBall.radius) {
                        collide(ball, otherBall);
                        simBalls[i] = ball.simulate(dt);
                        simBalls[j] = otherBall.simulate(dt);
                    }
                }
            }
        }

        for (let i = 0; i < this.balls.length; ++i) {
            if (this.balls[i].isMoving) {
                this.balls[i].move(dt, simBalls[i]);
            }
        }

        return this.balls.some(b => b.isMoving);
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
                }
                this.timestamp = timestamp;
            })
        }
    }

}

Game.snooker = new Game('snooker', Table.snooker, Cue.snooker, Ball.snookerAll);
Game.pool = new Game('pool', Table.pool, Cue.pool, Ball.poolAll);

export var games = [
    Game.snooker,
    Game.pool
];

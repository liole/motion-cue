import dom from './../dom.js';
import { simulate } from './../physics.js';

export class Ball {

    constructor(radius, color) {
        this.radius = radius;
        this.color = color;
        this.visible = true;
        this.reset({ x: 50, y: 25 });
    }

    copyTo(ball) {
        ball.x = this.x;
        ball.y = this.y;
        ball.velocity = { x: this.velocity.x, y: this.velocity.y };
        ball.spin = { x: this.spin.x, y: this.spin.y, z: this.spin.z };
        ball.active = this.active;
    }

    reset(point) {
        this.x = point.x;
        this.y = point.y;
        this.velocity = { x: 0, y: 0};
        this.spin = { x: 0, y: 0, z: 0 };
        this.active = true;
        this.trace = false;
        this.inHand = false;
        this.tracePoints = [];
    }

    setTrace(trace) {
        this.trace = trace;
        this.tracePoints = [];
    }

    get isMoving() {
        let eps = 1;
        let isMoving = this.active && (
            Math.abs(this.velocity.x) > eps ||
            Math.abs(this.velocity.y) > eps ||
            Math.abs(this.spin.x) > eps ||
            Math.abs(this.spin.y) > eps ||
            Math.abs(this.spin.z) > eps);
        if (!isMoving) {
            this.stop();
        }
        return isMoving;
    }

    stop() {
        this.velocity = { x: 0, y: 0 };
        this.spin = { x: 0, y: 0, z: 0 };
    }

    simulate(dt) {
        return simulate(this, dt);
    }

    move(dt, data = this.simulate(dt)) {
        this.x = data.x;
        this.y = data.y;
        this.velocity = data.velocity;
        this.spin = data.spin;
        if (this.trace) {
            this.tracePoints.push({ x: this.x, y: this.y });
        }
    }

    retrace() {
        let end = this.tracePoints.length - 1;
        this.tracePoints[end] = { x: this.x, y: this.y };
    }

    pot() {
        this.active = false;
    }

    render(root) {
        if (!this.$ball || !this.$trace) {
            this.$ball = dom.svg('circle', {
                style: `fill: ${this.color}; stroke: #f00; stroke-width: ${this.radius / 2}`
            });
            this.$ball.set('r', this.radius);
            root.append(this.$ball);

            this.$trace = dom.svg('polyline', {
                style: `fill: none; stroke: ${this.color}; stroke-width: 0.1px; stroke-linejoin: round`
            });
            root.insertAfter(this.$trace, dom('#table-surface'));
        }

        this.$ball.set('visibility', this.active && this.visible ? 'visible' : 'hidden');
        this.$ball.set('stroke-opacity', this.inHand ? 0.5 : 0);
        this.$ball.set('cx', this.x);
        this.$ball.set('cy', this.y);

        this.$trace.set('visibility', this.trace ? 'visible' : 'hidden');
        this.$trace.set('points', this.tracePoints.map(p => `${p.x}, ${p.y}`).join(' '));

        return [this.$ball, this.$trace];
    }

    dispose() {
        this.$ball && this.$ball.remove();
        this.$trace && this.$trace.remove();
    }

}

Ball.snooker = (color = '#fff') => new Ball(0.724, color);

Ball.snookerRedN = n => [
    Ball.snooker(),
    Ball.snooker('#ffff00'),
    Ball.snooker('#00cc00'),
    Ball.snooker('#996633'),
    Ball.snooker('#0000ff'),
    Ball.snooker('#fb5f87'),
    Ball.snooker('#000000'),
    ...new Array(n).fill().map(() => Ball.snooker('#dd0000'))
];

Ball.snookerAll = Ball.snookerRedN(15);
Ball.snookerShort = Ball.snookerRedN(6);

Ball.pool = (color = '#fff') => new Ball(1.1, color);

Ball.poolAll = [
    Ball.pool(),
    Ball.pool('#000000'),
    ...new Array(7).fill().map(() => Ball.pool('#dd0000')),
    ...new Array(7).fill().map(() => Ball.pool('#0000ff'))
];
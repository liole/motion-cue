import dom from './../dom.js';
import { vector, project, orthogonal, add, reverse } from '../utils.js';

export class Ball {

    constructor(radius, color) {
        this.radius = radius;
        this.color = color;
        this.reset({ x: 50, y: 25 });
    }

    reset(point) {
        this.x = point.x;
        this.y = point.y;
        this.velocity = { x: 0, y: 0};
        this.spin = { x: 0, y: 0, z: 0 };
        this.active = true;
    }

    get isMoving() {
        let eps = 1;
        let isMoving = this.active ||
            Math.abs(this.velocity.x) > eps ||
            Math.abs(this.velocity.y) > eps ||
            Math.abs(this.spin.x) > eps ||
            Math.abs(this.spin.y) > eps ||
            Math.abs(this.spin.z) > eps;
        if (!isMoving) {
            this.velocity = { x: 0, y: 0 };
            this.spin = { x: 0, y: 0, z: 0 };
        }
        return isMoving;
    }

    simulate(dt) {
        return simulate(this, dt);
    }

    move(dt, data = this.simulate(dt)) {
        this.x = data.x;
        this.y = data.y;
        this.velocity = data.velocity;
        this.spin = data.spin;
    }

    pot() {
        this.active = false;
    }

    render(root) {
        if (!this.$ball) {
            this.$ball = dom.svg('circle', {
                style: `fill: ${this.color}`
            });
            this.$ball.set('r', this.radius);
            root.append(this.$ball);
        }

        this.$ball.set('visibility', this.active ? 'visible' : 'hidden');
        this.$ball.set('cx', this.x);
        this.$ball.set('cy', this.y);

        return [this.$ball];
    }

}

export function simulate({ x, y, velocity, spin, radius }, dt, fs = 1, fv = 0.25, k = 2, kz = 0.01) {
    return {
        x: x + velocity.x * dt,
        y: y + velocity.y * dt,
        velocity: {
            x: velocity.x - Math.sign(velocity.x - spin.x * radius) * dt * k + velocity.y * spin.z * radius * dt * kz - (velocity.x - spin.x * radius) * dt * fv,
            y: velocity.y - Math.sign(velocity.y - spin.y * radius) * dt * k - velocity.x * spin.z * radius * dt * kz - (velocity.y - spin.y * radius) * dt * fv
        },
        spin: {
            x: spin.x - Math.sign(spin.x - velocity.x / radius) * dt * k - spin.x * dt * fs,
            y: spin.y - Math.sign(spin.y - velocity.y / radius) * dt * k - spin.y * dt * fs,
            z: spin.z - Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y) * spin.z / radius * dt * kz - spin.z * dt * fs
        }
    };
}

export function collide(b1, b2) {
    let n = vector(b1, b2);
    let v1n = project(n, b1.velocity);
    let v2n = b2.velocity ? project(n, b2.velocity) : reverse(v1n);

    let ort = orthogonal(n);
    let v1o = project(ort, b1.velocity);
    let v2o = b2.velocity ? project(ort, b2.velocity) : reverse(v1o);

    b1.velocity = add(v1o, v2n);
    b2.velocity = add(v2o, v1n);

    //TODO: z spin
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
Ball.snookerShort = Ball.snookerRedN(10);

Ball.pool = (color = '#fff') => new Ball(1.1, color);

Ball.poolAll = [
    Ball.pool(),
    Ball.pool('#000000'),
    ...new Array(7).fill().map(() => Ball.pool('#dd0000')),
    ...new Array(7).fill().map(() => Ball.pool('#0000ff'))
];
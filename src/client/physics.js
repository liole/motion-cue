import { vector, project, orthogonal, add, reverse, mult, sqr, sub, dist, mirror, distPolygon, len } from './utils.js';

export function simulate({ x, y, velocity, spin, radius }, dt, fs = 1, fv = 0.25, k = 2, kz = 0.1) {
    velocity = velocity || { x: 0, y: 0 };
    spin = spin || { x: 0, y: 0, z: 0 };
    radius = radius || 1;

    let totalSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y) || 1;
    return {
        x: x + velocity.x * dt,
        y: y + velocity.y * dt,
        velocity: {
            x: velocity.x - Math.sign(velocity.x - spin.x * radius) * dt * k + velocity.y / totalSpeed * spin.z * radius * dt * kz - (velocity.x - spin.x * radius) * dt * fv,
            y: velocity.y - Math.sign(velocity.y - spin.y * radius) * dt * k - velocity.x / totalSpeed * spin.z * radius * dt * kz - (velocity.y - spin.y * radius) * dt * fv
        },
        spin: {
            x: spin.x - Math.sign(spin.x - velocity.x / radius) * dt * k - spin.x * dt * fs,
            y: spin.y - Math.sign(spin.y - velocity.y / radius) * dt * k - spin.y * dt * fs,
            z: spin.z - spin.z * dt * kz - spin.z * dt * fs
        }
    };
}

// collide at the exact point of collision
export function collide(b1, b2) {

    let v1 = b1.velocity, v2 = b2.velocity || { x: 0, y: 0 };
    let dv = sub(v1, v2), dp = sub(b1, b2);
    let r = b2.radius ? b1.radius + b2.radius : 2*b1.radius;

    let D = r*r * (sqr(dv.x) + sqr(dv.y)) - sqr(dv.y*dp.x - dv.x*dp.y);
    
    let dt = 0;
    if (D >= 0) {
        dt = - (dp.x*dv.x + dp.y*dv.y + Math.sqrt(D)) / (sqr(dv.x) + sqr(dv.y));
        dt = dt > 0 ? dt : 0;
    }

    Object.assign(b1, simulate(b1, dt));
    Object.assign(b2, simulate(b2, dt));

    b1.retrace && b1.retrace();
    b2.retrace && b2.retrace();

    collide_internal(b1, b2);

    Object.assign(b1, simulate(b1, -dt));
    Object.assign(b2, simulate(b2, -dt));
}

// exchange speeds according to trajectories
function collide_internal(b1, b2, tk = 0.2) {
    let n = vector(b1, b2);
    let v1n = project(n, b1.velocity);
    let v2n = project(n, b2.velocity);

    let ort = orthogonal(n);
    let v1o = project(ort, b1.velocity);
    let v2o = project(ort, b2.velocity);

    b1.velocity = add(v1o, v2n);
    b2.velocity = add(v2o, v1n);

    if (b1.radius) {
        let s1v = b1.spin.z * b1.radius;
        b2.velocity = add(b2.velocity, mult(ort, s1v * tk));

        if (!b2.radius) {
            b1.velocity = add(b1.velocity, mult(ort, -s1v));
        }
    }
    if (b2.radius) {
        let s2v = b2.spin.z * b2.radius;
        b1.velocity = add(b1.velocity, mult(ort, s2v * tk));
    }

    //TODO: transfer spin
}

// fix any overlapping objects
export function applyShapes(balls, table, maxRounds = 10) {
    let fixed = [];

    for(let round = 0; round < maxRounds; ++round) {

        for (let ball of balls.filter(b => !fixed.includes(b))) {
            let distTable = distPolygon(table, ball);
            let overlap = ball.radius - distTable[0];
            if (overlap > 0) {
                let v = vector(mirror(distTable[1], distTable[2], ball), ball);
                Object.assign(ball, add(ball, mult(v, overlap)));
                fixed.push(ball);
            }
        }

        let shift = balls.map(b => ({ x: 0, y: 0}));

        for (let i = 0; i < balls.length; ++i) {
            for (let j = i+1; j < balls.length; ++j) {
                let distBalls = dist(balls[i], balls[j]);
                let overlap = balls[i].radius + balls[j].radius - distBalls;
                if (overlap > 0) {
                    let v = vector(balls[i], balls[j]);
                    let k = 0.5;
                    if (fixed.includes(balls[i]) || fixed.includes(balls[j])) {
                        k = 1;
                    }
                    if (!fixed.includes(balls[i])) {
                        shift[i] = add(shift[i], mult(v, -overlap * k));
                    }
                    if (!fixed.includes(balls[j])) {
                        shift[j] = add(shift[j], mult(v, overlap * k));
                    }
                }
            }
        }

        if (shift.every(d => len(d) < 1e-2)) {
            break;
        }

        for (let i = 0; i < balls.length; ++i) {
            Object.assign(balls[i], add(balls[i], shift[i]));
        }

    }
}

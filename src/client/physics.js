import { vector, project, orthogonal, add, reverse, mult, sqr, sub } from './utils.js';

export function simulate({ x, y, velocity, spin, radius }, dt, fs = 1, fv = 0.25, k = 2, kz = 0.1) {
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

    Object.assign(b1, add(b1, mult(v1, dt)));
    Object.assign(b2, add(b2, mult(v2, dt)));

    collide_internal(b1, b2);

    Object.assign(b1, add(b1, mult(v1, -dt)));
    Object.assign(b2, add(b2, mult(v2, -dt)));
}

// exchange speeds according to trajectories
function collide_internal(b1, b2, tk = 0.2) {
    let n = vector(b1, b2);
    let v1n = project(n, b1.velocity);
    let v2n = b2.velocity ? project(n, b2.velocity) : reverse(v1n);

    let ort = orthogonal(n);
    let v1o = project(ort, b1.velocity);
    let v2o = b2.velocity ? project(ort, b2.velocity) : reverse(v1o);

    b1.velocity = add(v1o, v2n);
    b2.velocity = add(v2o, v1n);

    if (b1.spin) {
        let s1v = b1.spin.z * b1.radius;
        b2.velocity = add(b2.velocity, mult(ort, s1v * tk));

        if (!b2.spin) {
            b1.velocity = add(b1.velocity, mult(ort, -s1v));
        }
    }
    if (b2.spin) {
        let s2v = b2.spin.z * b2.radius;
        b1.velocity = add(b1.velocity, mult(ort, s2v * tk));
    }

    //TODO: transfer spin
}

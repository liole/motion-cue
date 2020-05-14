export function shift(p, angle, dist) {
    return {
        x: p.x + Math.cos(angle) * dist,
        y: p.y - Math.sin(angle) * dist
    };
}

export function sqr(x) {
    return x * x;
}

export function len(v) {
    return Math.sqrt(v.x*v.x + v.y*v.y);
}

export function dist(p1, p2) {
    return Math.sqrt(sqr(p1.x - p2.x) + sqr(p1.y - p2.y));
}

export function distLine(p1, p2, p) {
    return Math.abs((p2.y - p1.y)*p.x - (p2.x - p1.x)*p.y + p2.x*p1.y - p2.y*p1.x) / dist(p1, p2)
}

export function distPolygon(points, p) {
    let pts = [...points, points[0]];
    let min = Infinity;
    let iMin = -1;
    for (let i = 0; i < points.length; ++i) {
        let d = distLine(pts[i], pts[i+1], p);
        let pIn = middle(mirror(pts[i], pts[i+1], p), p);
        let dp = dot(vector(pts[i], pIn), vector(pts[i+1], pIn));
        if (dp > 0) {
            d = Math.max(dist(pts[i], p), dist(pts[i+1], p));
        }
        if (d < min) {
            min = d;
            iMin = i;
        }
    }
    return [min, pts[iMin], pts[iMin+1]];
}

export function mirror(p1, p2, p) {
    let dx = p2.x - p1.x;
    let dy= p2.y - p1.y;
    let d = sqr(dx) + sqr(dy);

    let a = (dx*dx - dy*dy) / d;
    let b = 2*dx*dy / d;

    return {
        x: a * (p.x - p1.x) + b * (p.y - p1.y) + p1.x,
        y: b * (p.x - p1.x) - a * (p.y - p1.y) + p1.y
    };
}

export function middle(p1, p2) {
    return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2
    };
}

export function vector(p1, p2) {
    let d = dist(p1, p2);
    return {
        x: (p2.x - p1.x) / d,
        y: (p2.y - p1.y) / d
    };
}

export function orthogonal(v) {
    return { x: v.y, y: -v.x };
}

export function add(p1, p2) {
    return {
        x: p1.x + p2.x,
        y: p1.y + p2.y
    };
}

export function sub(p1, p2) {
    return {
        x: p1.x - p2.x,
        y: p1.y - p2.y
    };
}

export function mult(v, k) {
    return {
        x: v.x * k,
        y: v.y * k
    };
}

export function reverse(v) {
    return { x: -v.x, y: -v.y };
} 

export function dot(p1, p2) {
    return p1.x * p2.x + p1.y * p2.y;
}

export function project(base, v) {
    let d = dot(base, v);
    return {
        x: base.x * d,
        y: base.y * d
    };
}

export function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function isInside(points, p) {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        if ((points[i].y > p.y) != (points[j].y > p.y) &&
            (p.x < (points[j].x - points[i].x) * (p.y - points[i].y) / (points[j].y - points[i].y) + points[i].x)) {
            inside = !inside;
        }
    }
    return inside;
}

export function shift(p, angle, dist) {
    return {
        x: p.x + Math.cos(angle) * dist,
        y: p.y - Math.sin(angle) * dist
    };
}

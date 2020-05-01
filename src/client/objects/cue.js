import { shift } from '/utils.js';
import dom from  '/dom.js';

export class Cue {

    constructor(length, width, color) {
        this.x = 50;
        this.y = 30;
        this.length = length;
        this.width = width;
        this.color = color;
        this.angle = - Math.PI / 4;
        this.tilt = 0; // not supported yet
    }

    aim(x, y, angle, distance) {
        this.angle = angle;
        let point = shift({ x, y }, angle, distance);
        this.x = point.x;
        this.y = point.y;
    }

    render(root) {
        if (!this.elem || !root.contains(this.elem)) {
            this.elem = dom.svg('polygon', {
                style: `fill: ${this.color}`
            })
            root.append(this.elem);
        }

        let start = { x: this.x, y: this.y };
        let end = shift(start, this.angle, this.length);

        var points = [
            shift(start, this.angle - Math.PI / 2, this.width[0] / 2),
            shift(end, this.angle - Math.PI / 2, this.width[1] / 2),
            shift(end, this.angle + Math.PI / 2, this.width[1] / 2),
            shift(start, this.angle + Math.PI / 2, this.width[0] / 2)
        ];

        this.elem.set('points', points.map(p => `${p.x}, ${p.y}`).join(' '));

        return this.elem;
    }

}

Cue.default = new Cue(50, [2, 2.5], '#784d2b');

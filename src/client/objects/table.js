import dom from './../dom.js';
import { shift } from './../utils.js';

export class Table {

    constructor(color, cushions, frame, initBalls) {
        this.color = color;
        this.cushions = cushions;
        this.frame = frame;
        this.initBalls = initBalls;
    }

    get points() {
        return this.cushions.points;
    }

    resetBalls(balls) {
        for (let [i, ball] of balls.entries()) {
            // randomize in 1% of the radius
            let d = Math.random() * ball.radius * 0.01;
            let ang = Math.random() * Math.PI * 2;
            let pos = this.initBalls(i);
            ball.reset(shift(pos, ang, d));
        }
    }

    render(root) {
        if (!this.$frame) {
            this.$cushions = dom.svg('rect', {
                style: `fill: ${this.cushions.color}`
            });
            this.$frame = dom.svg('rect', {
                style: `fill: none; stroke: ${this.frame.color}; stroke-width: ${this.frame.thickness}`
            });
            for (let rect of [this.$cushions, this.$frame]) {
                rect.set('x', this.frame.x);
                rect.set('y', this.frame.y);
                rect.set('rx', this.frame.thickness);
                rect.set('ry', this.frame.thickness);
                rect.set('width', this.frame.width);
                rect.set('height', this.frame.height);
            }
            this.$cloth = dom.svg('polygon', {
                style: `fill: ${this.color}`
            });
            this.$cloth.set('points', this.cushions.points.map(p => `${p.x}, ${p.y}`).join(' '));
            root.append(this.$cushions, this.$cloth, this.$frame);
        }

        return [this.$frame];
    }

}

Table.snooker = new Table('#228b22', {
    color: '#006400',
    points: [{ x: 2.91, y: 1.5 }, { x: 5.41, y: 3 }, { x: 47.5, y: 3 }, { x: 49, y: 1.5 }, { x: 49, y: 0.5 }, { x: 51, y: 0.5 }, { x: 51, y: 1.5 },
        { x: 52.5, y: 3 }, { x: 94.59, y: 3 }, { x: 97.09, y: 1.5 }, { x: 97.09, y: 1 }, { x: 99, y: 1 }, { x: 99, y: 2.91 },
        { x: 98.5, y: 2.91 }, { x: 97, y: 5.41 }, { x: 97, y: 44.59 }, { x: 98.5, y: 47.09 }, { x: 99, y: 47.09 }, { x: 99, y: 49 }, { x: 97.09, y: 49 },
        { x: 97.09, y: 48.5 }, { x: 94.59, y: 47 }, { x: 52.5, y: 47 }, { x: 51, y: 48.5 }, { x: 51, y: 49.5 }, { x: 49, y: 49.5 },
        { x: 49, y: 48.5 }, { x: 47.5, y: 47 }, { x: 5.41, y: 47 }, { x: 2.91, y: 48.5 }, { x: 2.91, y: 49 }, { x: 1, y: 49 }, { x: 1, y: 47.09 },
        { x: 1.5, y: 47.09 }, { x: 3, y: 44.59 }, { x: 3, y: 5.41 }, { x: 1.5, y: 2.91 }, { x: 1, y: 2.91 }, { x: 1, y: 1 }, { x: 2.91, y: 1 } ]
}, {
    color: '#4a2106',
    x: 0.75, y: 0.75,
    width: 98.5, height: 48.5,
    thickness: 1.5
}, i => {
    var middleD = { x: 78.9, y: 25 };
    var dist = Math.random() * 8.06;
    var ang = Math.random() * Math.PI - Math.PI / 2;
    var cueBall = shift(middleD, ang, dist)
    return [
        cueBall,
        { x: 78.9, y: 16.97 }, { x: 78.9, y: 33.06 }, middleD,
        { x: 50, y: 25 },
        { x: 25, y: 25 },
        { x: 8.94, y: 25 },
        { x: 23.537, y: 25 },
        { x: 22.27, y: 24.268 }, { x: 22.27, y: 25.732 },
        { x: 21.003, y: 23.537 }, { x: 21.003, y: 25 }, { x: 21.003, y: 26.463 },
        { x: 19.736, y: 22.805 }, { x: 19.736, y: 24.268 }, { x: 19.736, y: 25.732 }, { x: 19.736, y: 27.159 },
        { x: 18.469, y: 22.074 }, { x: 18.469, y: 23.537 }, { x: 18.469, y: 25 }, { x: 18.469, y: 26.463 }, { x: 18.469, y: 27.926 }
    ][i];
});
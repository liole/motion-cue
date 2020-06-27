import dom from './../dom.js';
import { shift, shuffle, mult, add, sub } from './../utils.js';

export class Table {

    constructor(color, cushions, frame, pockets, initBalls, decorate) {
        this.color = color;
        this.cushions = cushions;
        this.frame = frame;
        this.pockets = pockets;
        this.initBalls = initBalls;
        this.decorate = decorate;
        this._pocketRatio = {
            value: 1.0,
            rendered: true
        };
    }

    get points() {
        let points = [...this.cushions.points];
        if (this.pockets.cushions && this.pocketRatio != 1) {
            for (let i = 0; i < this.pockets.points.length; ++i) {
                let pocket = this.pockets.points[i];
                for (let j of this.pockets.cushions[i]) {
                    let v = sub(points[j], pocket);
                    points[j] = add(pocket, mult(v, this.pocketRatio));
                }
            }
        }
        return points;
    }

    get pocketRadius() {
        return this.pockets.radius * this.pocketRatio;
    }

    get pocketRatio() {
        return this._pocketRatio.value;
    }

    set pocketRatio(value) {
        this._pocketRatio.value = value;
        this._pocketRatio.rendered = false;
    }

    resetBalls(balls) {
        let ballsPos = this.initBalls();
        for (let [i, ball] of balls.entries()) {
            // randomize in 1% of the radius
            let d = Math.random() * ball.radius * 0.01;
            let ang = Math.random() * Math.PI * 2;
            let pos = ballsPos[i];
            ball.reset(shift(pos, ang, d));
        }
    }

    render(root) {
        if (!this.$cushions || !this.$frame || !this.$cloth ||!this.$pockets) {
            this.$cushions = dom.svg('rect', {
                style: `fill: ${this.cushions.color}`
            });
            this.$frame = dom.svg('rect', {
                style: `fill: none; stroke: ${this.frame.color}; stroke-width: ${this.frame.thickness - 0.05 /* ensure inside the viewport */}`
            });
            for (let rect of [this.$cushions, this.$frame]) {
                rect.set('x', this.frame.x);
                rect.set('y', this.frame.y);
                rect.set('rx', this.frame.thickness / 2);
                rect.set('ry', this.frame.thickness / 2);
                rect.set('width', this.frame.width);
                rect.set('height', this.frame.height);
            }
            this.$cloth = dom.svg('polygon', {
                style: `fill: ${this.color}`,
                id: 'table-surface'
            });
            this.$cloth.set('points', this.cushions.points.map(p => `${p.x}, ${p.y}`).join(' '));
            this.$pockets = this.pockets.points.map(p => {
                let $pocket = dom.svg('circle', {
                    style: `fill: ${this.pockets.color}`
                });
                $pocket.set('cx', p.x);
                $pocket.set('cy', p.y);
                $pocket.set('r', this.pockets.radius);
                return $pocket;
            })
            root.append(this.$cushions, this.$cloth, this.$frame, ...this.$pockets);

            this.$decorations = this.decorate && this.decorate(root);
        }

        if (!this._pocketRatio.rendered) {
            for (let $pocket of this.$pockets) {
                $pocket.set('r', this.pocketRadius);
            }
            this.$cloth.set('points', this.points.map(p => `${p.x}, ${p.y}`).join(' '));
            this._pocketRatio.rendered = true;
        }

        return [this.$cushions, this.$frame, this.$cloth, ...this.$pockets];
    }

    dispose() {
        this.$cushions && this.$cushions.remove();
        this.$frame && this.$frame.remove();
        this.$cloth && this.$cloth.remove();
        this.$pockets && this.$pockets.forEach($pocket => $pocket.remove());
        this.$decorations && this.$decorations.forEach($decoration => $decoration.remove());
    }

}

Table.snooker = new Table('#228b22', {
    color: '#006400',
    points: [{ x: 2.91, y: 1.5 }, { x: 5.41, y: 3 }, { x: 47.5, y: 3 }, { x: 49, y: 1.5 }, { x: 49, y: 0.5 }, { x: 51, y: 0.5 },
        { x: 51, y: 1.5 }, { x: 52.5, y: 3 }, { x: 94.59, y: 3 }, { x: 97.09, y: 1.5 }, { x: 97.09, y: 1 }, { x: 99, y: 1 }, { x: 99, y: 2.91 },
        { x: 98.5, y: 2.91 }, { x: 97, y: 5.41 }, { x: 97, y: 44.59 }, { x: 98.5, y: 47.09 }, { x: 99, y: 47.09 }, { x: 99, y: 49 }, { x: 97.09, y: 49 },
        { x: 97.09, y: 48.5 }, { x: 94.59, y: 47 }, { x: 52.5, y: 47 }, { x: 51, y: 48.5 }, { x: 51, y: 49.5 }, { x: 49, y: 49.5 },
        { x: 49, y: 48.5 }, { x: 47.5, y: 47 }, { x: 5.41, y: 47 }, { x: 2.91, y: 48.5 }, { x: 2.91, y: 49 }, { x: 1, y: 49 }, { x: 1, y: 47.09 },
        { x: 1.5, y: 47.09 }, { x: 3, y: 44.59 }, { x: 3, y: 5.41 }, { x: 1.5, y: 2.91 }, { x: 1, y: 2.91 }, { x: 1, y: 1 }, { x: 2.91, y: 1 } ]
}, {
    color: '#4a2106',
    x: 0.75, y: 0.75,
    width: 98.5, height: 48.5,
    thickness: 1.5
}, {
    color: '#000000',
    points: [{ x: 2.21, y: 2.21 }, { x: 50, y: 1.5 }, { x: 97.79, y: 2.21 }, { x: 97.79, y: 47.79 }, { x: 50, y: 48.5 }, { x: 2.21, y: 47.79 }],
    cushions: [[36, 0], [3, 6], [9, 13], [16, 20], [23, 26], [29, 33]],
    radius: 1
}, () => {
    var middleD = { x: 78.9, y: 25 };
    var dist = 2 + Math.random() * (8.06 - 2);
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
    ];
}, root => {
    let options = {
        style: `fill: none; stroke: #fff; stroke-width: 0.15`
    };
    let $line = dom.svg('line', options);
    let $arc = dom.svg('path', options);

    $line.set('x1', 78.9);
    $line.set('y1', 3);
    $line.set('x2', 78.9);
    $line.set('y2', 47);

    $arc.set('d', `M78.9 16.97 A8.03 8.03 0 0 1 78.9 33.06`);

    root.append($line, $arc);
    return [$line, $arc];
});

Table.pool = new Table('#166923', {
    color: '#269136',
    points: [{ x: 7.2, y: 4.8 }, { x: 8.2, y: 5.8 }, { x: 47.65, y: 5.8 }, { x: 48.15, y: 4.8 }, { x: 47.8, y: 4.8 }, { x: 47.8, y: 1.3 }, { x: 52.2, y: 1.3 }, { x: 52.2, y: 4.8 },
        { x: 51.85, y: 4.8 }, { x: 52.35, y: 5.8 }, { x: 91.8, y: 5.8 }, { x: 92.8, y: 4.8 }, { x: 92.8, y: 2.8 }, { x: 97.2, y: 2.8 }, { x: 97.2, y: 7.2 },
        { x: 95.2, y: 7.2 }, { x: 94.2, y: 8.2 }, { x: 94.2, y: 41.8 }, { x: 95.2, y: 42.8 }, { x: 97.2, y: 42.8 }, { x: 97.2, y: 47.2 }, { x: 92.8, y: 47.2 },
        { x: 92.8, y: 45.2 }, { x: 91.8, y: 44.2 }, { x: 52.35, y: 44.2 }, { x: 51.85, y: 45.2 }, { x: 52.2, y: 45.2 }, { x: 52.2, y: 48.7 }, { x: 47.8, y: 48.7 }, { x: 47.8, y: 45.2 },
        { x: 48.15, y: 45.2 }, { x: 47.65, y: 44.2 }, { x: 8.2, y: 44.2 }, { x: 7.2, y: 45.2 }, { x: 7.2, y: 47.2 }, { x: 2.8, y: 47.2 }, { x: 2.8, y: 42.8 },
        { x: 4.8, y: 42.8 }, { x: 5.8, y: 41.8 }, { x: 5.8, y: 8.2 }, { x: 4.8, y: 7.2 }, { x: 2.8, y: 7.2 }, { x: 2.8, y: 2.8 }, { x: 7.2, y: 2.8 } ]
}, {
    color: '#6d1000',
    x: 2.4, y: 2.4,
    width: 95.2, height: 45.2,
    thickness: 4.8
}, {
    color: '#000000',
    points: [{ x: 5, y: 5 }, { x: 50, y: 3.5 }, { x: 95, y: 5 }, { x: 95, y: 45 }, { x: 50, y: 46.5 }, { x: 5, y: 45 }],
    cushions: [[40, 0], [3, 8], [11, 15], [18, 22], [25, 30], [33, 37]],
    radius: 2.2
}, () => {
    var cueBall = {
        x: 75 + 15 * Math.random(),
        y: 7 + 36 * Math.random()
    };
    return [
        cueBall,
        { x: 21.12, y: 25 }, 
        ...shuffle([{ x: 25, y: 25 },
        { x: 23.06, y: 23.88 }, { x: 23.06, y: 26.12 },
        { x: 21.12, y: 22.76 }, /* { x: 21.12, y: 25 }, */ { x: 21.12, y: 27.24 },
        { x: 19.18, y: 21.64 }, { x: 19.18, y: 23.88 }, { x: 19.18, y: 26.12 }, { x: 19.18, y: 28.36 },
        { x: 17.24, y: 20.52 }, { x: 17.24, y: 22.76 }, { x: 17.24, y: 25 }, { x: 17.24, y: 27.24 }, { x: 17.24, y: 29.48 }])
    ];
});
import { shift } from './../utils.js';
import dom from  './../dom.js';

export class Cue {

    constructor(length, width, color) {
        this.x = 50;
        this.y = 30;
        this.length = length;
        this.width = width;
        this.color = color;
        this.angle = - Math.PI / 4;
        this.tilt = 0; // not supported yet
        this.showAim = false;
        this.visible = true;
    }

    copyTo(cue) {
        cue.x = this.x;
        cue.y = this.y;
        cue.angle = this.angle;
        cue.tilt = this.tilt;
    }

    aim(x, y, angle, distance) {
        this.angle = angle;
        let point = shift({ x, y }, angle, distance);
        this.x = point.x;
        this.y = point.y;
    }

    render(root) {
        if (!this.$cue || !this.$aim) {
            this.$cue = dom.svg('polygon', {
                style: `fill: ${this.color}`
            });
            this.$aim = dom.svg('line', {
                style: `stroke: #f00; stroke-width: 0.1; stroke-dasharray: 0.5`,
            })
            root.append(this.$cue, this.$aim);
        }

        let start = { x: this.x, y: this.y };
        let end = shift(start, this.angle, this.length);

        var points = [
            shift(start, this.angle - Math.PI / 2, this.width[0] / 2),
            shift(end, this.angle - Math.PI / 2, this.width[1] / 2),
            shift(end, this.angle + Math.PI / 2, this.width[1] / 2),
            shift(start, this.angle + Math.PI / 2, this.width[0] / 2)
        ];

        this.$cue.set('visibility', this.visible ? 'visible' : 'hidden');
        this.$cue.set('points', points.map(p => `${p.x}, ${p.y}`).join(' '));

        this.$aim.set('visibility', this.showAim ? 'visible' : 'hidden');
        if (this.showAim) {
            let aimStart = start;
            let aimEnd = shift(aimStart, this.angle + Math.PI, 100*Math.SQRT2);
            this.$aim.set('x1', aimStart.x);
            this.$aim.set('y1', aimStart.y);
            this.$aim.set('x2', aimEnd.x);
            this.$aim.set('y2', aimEnd.y);
        }

        return [this.$cue, this.$aim];
    }

    dispose() {
        this.$cue && this.$cue.remove();
        this.$aim && this.$aim.remove();
    }

}

Cue.snooker = new Cue(40, [0.5, 1], '#784d2b');
Cue.pool = new Cue(40, [1, 2], '#cca88d');
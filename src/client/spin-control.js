import dom from './dom.js';
import { shift } from './utils.js';

export class SpinControl {

    constructor() {
        this.reset();
    }

    copyTo(spinControl) {
        spinControl.dist = this.dist;
        spinControl.angle = this.angle;
    }

    toXY() {
        return {
            x: this.dist * Math.cos(this.angle),
            y: this.dist * Math.sin(this.angle)
        };
    }

    reset() {
        this.dist = 0;
        this.angle = 0;
    }

    aim(x, y) {
        this.dist = Math.sqrt(x*x + y*y);

        if (this.dist > 1) {
            this.dist = 1;
        }

        if (this.dist < 1e-7) {
            this.angle = 0;
        } else if (this.x < 1e-7) {
            if (this.y > 0) {
                this.angle = Math.PI / 4;
            } else {
                this.angle = 3 * Math.PI / 4;
            }
        } else {
            if (x > 0) {
                this.angle = Math.atan(y/x);
            } else {
                this.angle = Math.PI + Math.atan(y/x);
            }
        }
    }

    render(root) {
        if (!this.$ball || !this.$aim) {
            this.$ball = dom.svg('circle', {
                style: 'fill: #fff'
            });
            this.$ball.set('cx', 50);
            this.$ball.set('cy', 50);
            this.$ball.set('r', 50);

            this.$aim = dom.svg('circle', {
                style: 'fill: #a22; stroke: #f55; stroke-width: 3'
            });
            this.$aim.set('r', 7);

            root.append(this.$ball, this.$aim);
        }

        var point = shift({ x: 50, y: 50 }, this.angle, this.dist * 50);
        this.$aim.set('cx', point.x);
        this.$aim.set('cy', point.y);

        return [this.$ball, this.$aim];
    }

}

SpinControl.default = new SpinControl();

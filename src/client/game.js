import { Cue } from './objects/cue.js';
import dom from './dom.js';
import { SpinControl } from './spin-control.js';

export class Game {

    constructor(type, cue) {
        this.type = type;
        this.cue = cue;
        this.spinControl = SpinControl.default;
    }

    handle(event) {
        if (event.init) {
            this.initControl(event);
            if (event.type == 'ball') {
                dom('#spin-view-box').classList.add('focus');
            }
        }
        if (event.init == null) {
            if (event.type == 'ball') {
                dom('#spin-view-box').classList.remove('focus');
            }
            return;
        }
        switch (event.type) {
            case 'cue':
                var angle = this.init.cue.angle + event.alpha - this.init.angle.alpha;
                this.cue.aim(50, 30, angle, 3);
                break;
            case 'ball':
                var x = this.init.ball.pos.x + Math.tan(this.init.angle.alpha - event.alpha) * 2;
                var y = this.init.ball.pos.y + Math.tan(event.beta - this.init.angle.beta) * 2;
                this.spinControl.aim(x, y);
        }
        this.queueRender();
    }

    initControl(event) {
        this.init = {
            angle: {
                alpha: event.alpha,
                beta: event.beta,
                gamma: event.gamma
            },
            cue: {
                angle: this.cue.angle
            },
            ball: {
                pos: this.spinControl.toXY()
            }
        };
    }

    render() {
        var table = dom('#table');
        this.cue.render(table);
        this.spinControl.render(dom('#spin-view'));
    }
    
    queueRender() {
        if (!this.frame) {
            this.frame = requestAnimationFrame(timestamp => {
                this.render();
                this.frame = undefined;
            })
        }
    }

}

Game.test = new Game('test', Cue.default);

export var games = [
    Game.test
];

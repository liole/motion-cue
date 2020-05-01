import { Cue } from '/objects/cue.js';
import dom from '/dom.js';

export class Game {

    constructor(type, cue) {
        this.type = type;
        this.cue = cue;
    }

    handle(event) {
        if (event.init) {
            this.initControl(event);
        }
        switch (event.type) {
            case 'cue':
                var angle = this.init.cue.angle + event.alpha - this.init.angle.alpha;
                this.cue.aim(50, 30, angle, 3);
                break;
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
            }
        };
    }

    render() {
        var table = dom('#table');
        if (!table.get('viewBox')) {
            table.set('viewBox', '0 0 100 50');
        }
        this.cue.render(table);
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

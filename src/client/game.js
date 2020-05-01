import { Cue } from '/objects/cue.js';
import dom from '/dom.js';

export class Game {

    constructor(type, cue) {
        this.type = type;
        this.cue = cue;
    }

    render() {
        var table = dom('#table');
        if (!table.get('viewBox')) {
            table.set('viewBox', '0 0 100 60');
        }
        this.cue.render(table);
    }

}

Game.test = new Game('test', Cue.default);

export var games = [
    Game.test
];

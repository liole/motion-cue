import dom from './../dom.js';

export class DefaultController {

    constructor() {
        this.events = [];
        this.players = [];
    }

    attach(game) {
        this.game = game;
        return this;
    }

    isActive(id) {
        return (this.players.find(p => p.id == id) || {}).active;
    }

    addPlayer(player) {
        if (!player) {
            player = {
                type: 'local',
                id: this.game.userID,
                score: 0,
                active: true
            };
        }
        this.players.push(player);
        this.render();
    }

    setPlayers(players) {
        this.players = players.map(p => ({
            type: (this.players.find(cp => cp.id == p.id) || { type: 'remote' }).type,
            id: p.id,
            score: p.score || 0,
            active: p.active
        }));
        this.render();
    }

    handle(type, event = {}) {
        if (type == 'stop') {
            this.process();
            this.events = [];
        } else {
            event.type = type;
            this.events.push(event);
        }
    }
    
    process() {
        console.log(this.events);
        if (this.events.some(e => e.type == 'pot' && e.ball == this.game.cueBall)) {
            this.returnToTable(this.game.cueBall);
            this.game.cueBall.inHand = true;
        }
        for (let event of this.events.filter(e => e.type == 'out' && e.ball.active)) {
            let { ball } = event;
            this.returnToTable(ball);
            if (ball == this.game.cueBall) {
                ball.inHand = true;
            }
        }
    }

    break() {
        var index = this.players.findIndex(p => p.active);
        var nextIndex = (index + 1) % this.players.length;
        this.players[index].active = false;
        this.players[nextIndex].active = true;
        this.render();
    }

    returnToTable(ball) {
        let i = this.game.balls.indexOf(ball);
        Object.assign(ball, this.game.table.initBalls()[i]);
        ball.active = true;
        ball.stop();
    }

    render() {
        let panel = dom('#score');
        panel.clear();

        for (let player of this.players) {
            let score = dom.new('div', {
                className: `score ${player.type}`,
                innerText: player.score || 0
            });
            if (player.active) {
                score.classList.add('active');
            }
            panel.append(score);
        }
    }
}
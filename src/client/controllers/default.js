import dom from './../dom.js';

export class DefaultController {

    constructor() {
        this.events = [];
        this.players = [];
        this.enabled = true;
    }

    attach(game) {
        this.game = game;
        return this;
    }

    get active() {
        return this.players.find(p => p.active);
    }

    isActive(id) {
        return this.players.some(p => p.id == id && p.active);
    }

    addPlayer(player) {
        player = Object.assign({
            type: 'local',
            id: this.game.userID,
            score: 0,
            break: 0,
            active: true
        }, player || {});
        this.players.push(player);
        this.render();
    }

    setPlayers(players) {
        this.players = players.map(p => ({
            ...p,
            type: (this.players.find(cp => cp.id == p.id) || { type: 'remote' }).type,
        }));
        this.render();
    }

    handle(type, event = {}) {
        if (!this.enabled) {
            return;
        }

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
        this.players[index].score += this.players[index].break;
        this.players[index].break = 0;
        this.players[nextIndex].active = true;
        this.render();
    }

    gameOver() {
        $alert('GAME OVER', Date.now());
    }

    returnToTable(ball) {
        let i = this.game.balls.indexOf(ball);
        Object.assign(ball, this.game.table.initBalls()[i]);
        ball.active = true;
        ball.stop();
    }

    get firstBall() {
        let firstCollision = this.events.find(e => e.type == 'collision' && e.balls.includes(this.game.cueBall));
        return firstCollision && firstCollision.balls.find(b => b != this.game.cueBall);
    }

    get pottedBall() {
        let pot = this.events.find(e => e.type == 'pot');
        return pot && pot.ball;
    }

    render() {
        if (!this.enabled) {
            return;
        }

        let $panel = dom('#score');
        $panel.clear();

        for (let player of this.players) {
            let $score = dom.new('div', {
                className: `score ${player.type}`,
                innerText: player.score || 0
            });
            if (player.active) {
                $score.classList.add('active');
            }
            $panel.append($score);
        }

        let active = this.players.find(p => p.active);
        let $break = dom.new('div', {
            className: `break`,
            innerText: active.break || 0
        });
        $panel.append($break);
    }
}
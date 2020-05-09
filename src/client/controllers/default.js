export class DefaultController {

    constructor() {
        this.events = [];
    }

    attach(game) {
        this.game = game;
        return this;
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

    returnToTable(ball) {
        let i = this.game.balls.indexOf(ball);
        Object.assign(ball, this.game.table.initBalls()[i]);
        ball.active = true;
        ball.stop();
    }
}
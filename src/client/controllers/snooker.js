import { DefaultController } from './default.js';

export class SnookerController extends DefaultController {

    constructor() {
        super();

        this.onRed = true;
        this.sequence = false;
    }

    get red() {
        return this.game.balls[7];
    }

    anyRedsLeft() {
        return this.game.balls.some(b => b.active && b.color == this.red.color);
    }

    get ballOn() {
        if (this.onRed) {
            return this.red;
        }
        if (this.sequence) {
            return this.balls.find(b => b.active && b != this.game.cueBall);
        }

        // TODO: handle nominating a ball
        if (this.firstBall && this.firstBall.color != this.red.color) {
            return this.firstBall;
        }

        return {};
    }


    process() {
        super.process();

        if (!this.sequence) {
            this.returnColors();
        }

        if (!this.firstBall ||
            this.firstBall.color != this.ballOn.color ||
            this.events.filter(e => e.type == 'pot').length > 1 ||
            this.pottedBall && this.pottedBall.color != this.ballOn.color ||
            this.events.some(e => e.type == 'pot' && e.ball == this.game.cueBall) ||
            this.events.some(e => e.type == 'out' && e.ball.active)) {

            this.returnColors();
            this.foul();
            return;
        }

        if (this.pottedBall) {
            this.active.break += this.getPoints(this.pottedBall);
            this.render();

            if (this.onRed) {
                this.onRed = false;
            } else {
                if (this.anyRedsLeft()) {
                    this.onRed = true;
                } else {
                    this.sequence = true;
                }
            }
        } else {
            $alert(`BREAK ${this.active.break}`);
            this.break();
        }

        if (!this.game.balls.some(b => b.active && b != this.game.cueBall)) {
            this.gameOver();
        }
    }

    returnColors() {
        for (let event of this.events.filter(e => e.type == 'pot' && e.ball.color != this.red.color)) {
            this.returnToTable(event.ball);
        }
    }

    foul() {
        let value = Math.max(4,
            this.getPoints(this.firstBall),
            this.getPoints(this.pottedBall),
            this.getPoints(this.ballOn));

        $alert(`FOUL ${value}`);
        if (this.players.length == 2) {
            var other = this.players.find(p => !p.active);
            other.score += value;
        } else {
            this.active.score -= value; 
        }
        this.break();
    }

    break() {
        super.break();
        this.onRed = this.anyRedsLeft();
    }

    getPoints(ball) {
        let index = this.game.balls.indexOf(ball);
        if (index < 1) {
            return 0; // cue ball
        }
        if (index >= 7) {
            return 1; // red
        }
        return index + 1; // colour
    }

}

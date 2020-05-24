import { DefaultController } from './default.js';

export class PoolController extends DefaultController {

    constructor() {
        super();

        this.solids = undefined;
    }

    get black() {
        return this.game.balls[1];
    }

    get solid() {
        return this.game.balls[2];
    }

    get striped() {
        return this.game.balls[this.game.balls.length - 1];
    }

    anySolidLeft() {
        return this.game.balls.some(b => b.active && b.color == this.solid.color);
    }

    anyStripedLeft() {
        return this.game.balls.some(b => b.active && b.color == this.striped.color);
    }

    process() {
        super.process();

        let activeIndex = this.players.findIndex(p => p.active) % 2;
        let activeSolids = this.solids === undefined || this.solids == activeIndex;
        let activeStripes = this.solids === undefined || this.solids != activeIndex;

        let pottedSolids = this.events.filter(e => e.type == 'pot' && e.ball.color == this.solid.color).length;
        let pottedStripes = this.events.filter(e => e.type == 'pot' && e.ball.color == this.striped.color).length;

        if (this.solids === undefined) {
            if (pottedSolids > 0) {
                this.solids = activeIndex;
                $alert('=RED'); // SOLID
            } else if (pottedStripes > 0) {
                this.solids = (activeIndex + 1) % 2;
                $alert('=BLUE'); // STRIPE
            }
        }        
        
        let toActive = 0;
        let toOthers = 0;
        if (this.solids == activeIndex) {
            toActive = pottedSolids;
            toOthers = pottedStripes;
        } else {
            toActive = pottedStripes;
            toOthers = pottedSolids;
        }

        if (toActive > 0) {
            this.active.break += toActive;
        }
        if (toOthers > 0) {
            for (let other of this.players.filter((p, i) => (i % 2) != activeIndex)) {
                other.break += toOthers;
            }
        }

        if (!this.firstBall ||
            !activeSolids && this.firstBall.color == this.solid.color ||
            !activeStripes && this.firstBall.color == this.striped.color ||
            !activeSolids && pottedSolids > 0 ||
            !activeStripes && pottedStripes > 0 ||
            this.events.some(e => e.type == 'pot' && e.ball == this.game.cueBall) ||
            this.events.some(e => e.type == 'out' && e.ball.active)) {

            this.foul();
            return;
        }

        if (this.events.some(e => e.type == 'pot' && e.ball.color == this.black.color)) {
            if (this.events.some(e => e.type == 'pot' && e.ball.color != this.black.color) ||
                activeSolids && this.anySolidLeft() ||
                activeStripes && this.anyStripedLeft()) {
                this.active.break = -this.active.score;
            } else {
                this.active.break = 1;
            }
            this.break();
            this.gameOver();
            return;
        }

        if (toActive == 0 || toOthers > 0) {
            $alert('BREAK');
            this.break();
        } else {
            this.render();
        }

    }

    foul() {
        $alert('FOUL');
        this.game.cueBall.inHand = true;
        this.break();
    }

}

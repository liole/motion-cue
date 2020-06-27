import dom from "./dom.js";

export class Settings {

    constructor(game) {
        this.game = game;
        this.init();
        this.apply();
        this.render();
        // Prediction is not correct without the event. Don't show it initially
        this.game.stopPrediction();
    }

    get trace() {
        return this.game.trace;
    }
    set trace(value) {
        this.game.triggerTrace(value);
        this.game.queueRender();
        this.render();
    }

    get aim() {
        return this.game.cue.showAim;
    }
    set aim(value) {
        this.game.cue.showAim = value;
        this.game.queueRender();
        this.render();
    }

    get predict() {
        return this.game.predict;
    }
    set predict(value) {
        this.game.triggerPredict(value);
        this.game.queueRender();
        this.render();
    }

    get pocket() {
        return this.game.table.pocketRatio;
    }
    set pocket(value) {
        this.setPocketNotPush(value);
        game.pushSync();
        this.render();
    }
    setPocketNotPush(value) {
        this.game.table.pocketRatio = value;
        game.queueRender();
    }

    init() {
        dom('#setting-aim').on('change', e => this.aim = e.target.checked);
        dom('#setting-trace').on('change', e => this.trace = e.target.checked);
        dom('#setting-predict').on('change', e => this.predict = e.target.checked);
        dom('#setting-pocket').on('change', e => this.pocket = +e.target.value);
        dom('#setting-pocket').on('input', e => this.setPocketNotPush(+e.target.value));
        dom('#setting-pocket').set('min', this.game.cueBall.radius / this.game.table.pockets.radius);
    }

    apply() {
        var settings = localStorage.settings;
        if (settings) {
            Object.assign(this, JSON.parse(settings));
        }
    }

    save() {
        localStorage.settings = JSON.stringify({
            aim: this.aim,
            trace: this.trace,
            predict: this.predict
        });
    }

    render() {
        if (dom('#setting-aim').checked != this.aim) {
            dom('#setting-aim').checked = this.aim;
        }
        if (dom('#setting-trace').checked != this.trace) {
            dom('#setting-trace').checked = this.trace;
        }
        if (dom('#setting-predict').checked != this.predict) {
            dom('#setting-predict').checked = this.predict;
        }
        if (dom('#setting-pocket').value != this.pocket) {
            dom('#setting-pocket').value = this.pocket;
        }
        this.save();
    }

}
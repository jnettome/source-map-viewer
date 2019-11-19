export class Progress {

    get finished() {
        return this.progress == this.steps && this.steps > 0;
    }

    constructor() {
        this.steps = 0;
        this.progress = 0;
    }

    addSteps(amount) {
        this.steps += amount;
    }

    clearSteps(amount) {
        this.progress += amount;
    }

    currentProgress() {
        return this.progress / this.steps;
    }

    finish() {
        this.progress = this.step;
    }

}

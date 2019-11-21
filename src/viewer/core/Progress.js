export class Progress {

    get finished() {
        return this.progress == this.steps && this.steps > 0;
    }

    constructor() {
        this.steps = 0;
        this.progress = 0;
        this.listeners = new Set();
    }

    onMessage(f) {
        this.listeners.add(f);
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

    message(...data) {
        const console = document.querySelector('dev-console');
        console.log(...data);

        for(let f of this.listeners) {
            f(...data);
        }
    }

}

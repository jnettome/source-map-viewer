import { render, html } from 'lit-html';

export class ProgressBar extends HTMLElement {

    constructor(progress) {
        super();

        this.progress = null;
        this.logs = [];

        this.attachShadow({ mode: 'open' });

        if(progress) {
            this.setProgress(progress);
        }
    }

    log(...stringArray) {
        this.logs.push(stringArray.join(" "));
    }

    setProgress(prog) {
        this.progress = prog;
        this.progress.onMessage((...data) => this.log(...data));
    }

    connectedCallback() {
        this.initialize();
        this.render();
    }

    initialize() {
        let lastchange = null;

        const update = () => {
            if(this.progress) {
                if(this.progress.finished) {
                    this.remove();
                    this.progress = null;
                }
                this.render();

                const log = this.shadowRoot.querySelector('.log');
                log.scrollTo(0, log.scrollHeight);
            }
            requestAnimationFrame(update);
        }

        update();
    }

    render() {
        let prog = 0;
        
        if(this.progress) {
            prog = this.progress.currentProgress();
        }
        const template = html`
            <style>
                :host {
                    position: fixed;
                    bottom: 15px;
                    left: 15px;
                    border: 1px solid white;
                    width: 400px;
                    height: 10px;

                    --progress: ${prog};
                }
                .progressbar {
                    height: 100%;
                    background: white;
                    width: calc(var(--progress) * 100%);
                }
                .log {
                    position: absolute;
                    bottom: 10px;
                    left: 0;
                    width: 100%;
                    margin-bottom: 10px;
                    display: flex;
                    flex-direction: column;
                    max-height: 100px;
                    overflow: hidden;
                    font-size: 12px;
                    font-family: 'Open-Sans', sans-serif;
                    font-weight: 300;
                }
                .log-line {

                }
            </style>
            <div class="log">
                ${this.logs.map(log => {
                    return html`<span class="log-line">${log}</span>`;
                })}
            </div>
            <div class="progressbar" data-progress="${prog}"></div>
        `;
        render(template, this.shadowRoot);
    }

}

customElements.define('progress-bar', ProgressBar);

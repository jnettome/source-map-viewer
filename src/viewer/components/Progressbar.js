import { render, html } from 'lit-html';

export class ProgressBar extends HTMLElement {

    constructor(progress) {
        super();

        this.progress = null;

        this.attachShadow({ mode: 'open' });

        if(progress) {
            this.setProgress(progress);
        }
    }

    setProgress(prog) {
        this.progress = prog;
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
            </style>
            <div class="progressbar" data-progress="${prog}"></div>
        `;
        render(template, this.shadowRoot);
    }

}

customElements.define('progress-bar', ProgressBar);

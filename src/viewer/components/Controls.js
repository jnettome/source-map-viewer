import { render, html } from 'lit-html';
import styles from './Controls.css';

export class ViewerControls extends HTMLElement {

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();

        const viewer = document.querySelector('source-map-viewer');
        this.initializeViewer(viewer);
    }

    initializeViewer(viewer) {
        console.log(viewer.scene);
    }

    render() {
        const template = html`
            <style>${styles}</style>
            <div class="options" tab="Options">
                <div class="layers">
                    <div class="layer>
                        <input type="checkbox">
                    </div>
                </div>
                <div>
                    <input type="number">
                </div>
            </div>
        `;
        render(template, this.shadowRoot);
    }

}

customElements.define('viewer-controls', ViewerControls);

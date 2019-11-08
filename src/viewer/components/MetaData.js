import { render, html } from 'lit-html';
import styles from './Components.css';

export class MetaData extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const viewer = document.querySelector('source-map-viewer');
        this.viewer = viewer;
        this.render();
    }

    render() {
        const viewer = this.viewer;

        const template = html`
            <style>${styles}</style>
            <div class="meta">
                <div class="row">
                    <span>Loaded map:</span>
                    <span>${viewer.mapinfo.name}</span>
                </div>
            </div>
        `;
        render(template, this.shadowRoot);
    }

}

customElements.define('viewer-metadata', MetaData);

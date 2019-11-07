import { render, html } from 'lit-html';
import styles from './Controls.css';

export class ViewerControls extends HTMLElement {

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const viewer = document.querySelector('source-map-viewer');
        this.initializeViewer(viewer);
        this.render();
    }

    initializeViewer(viewer) {
        this.viewer = viewer;

        const scene = this.viewer.scene;

        let lastchange = null;

        const update = () => {
            if(scene.lastchange != lastchange) {
                lastchange = scene.lastchange;
    
                this.render();
            }

            requestAnimationFrame(update);
        }

        update();
    }

    render() {
        const viewer = this.viewer;
        const renderer = this.viewer.renderer;
        const layers = [...this.viewer.scene.objects] || [];

        const template = html`
            <style>${styles}</style>
            <div class="options" tab="Options">
                <div class="meta">
                    <div class="row">
                        <span>Loaded map:</span>
                        <span>${viewer.mapinfo.name}</span>
                    </div>
                    <div class="row">
                        <span>Show Grid</span>
                        <input type="checkbox" ?checked=${renderer.showGrid} @change=${(e) => { renderer.showGrid = e.target.checked; }}/>
                    </div>
                </div>
                <div class="layers">
                    ${layers.map(layer => {
                        return html`
                            <div class="layer row">
                                <span class="title">${layer.constructor.name}</span>
                                <input type="checkbox" ?checked=${!layer.hidden} @change=${(e) => {
                                    layer.hidden = !e.target.checked;
                                }}/>
                            </div>
                        `;
                    })}
                </div>
            </div>
        `;
        render(template, this.shadowRoot);
    }

}

customElements.define('viewer-controls', ViewerControls);

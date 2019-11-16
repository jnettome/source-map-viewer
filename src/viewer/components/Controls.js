import { render, html } from 'lit-html';
import styles from './Components.css';
import './CheckBox.js';

export class ViewerControls extends HTMLElement {

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const viewer = document.querySelector('source-map-viewer');
        this.initialize(viewer);
        this.render();
    }

    initialize(viewer) {
        this.viewer = viewer;

        let lastchange = null;

        const update = () => {
            const scene = this.viewer.scene;
            if(scene && scene.lastchange != lastchange) {
                lastchange = scene.lastchange;
    
                this.render();
            }

            requestAnimationFrame(update);
        }

        update();
    }

    focusLayer(layer) {
        this.focusedLayer = layer;
        this.render();
    }

    render() {
        if(!this.viewer.scene) {
            return;
        }
        
        const renderer = this.viewer.renderer;
        const layers = [...this.viewer.scene.objects] || [];

        const template = html`
            <style>${styles}</style>
            <div class="options">
                <div class="meta">
                    <div class="row">
                        <span>Show Grid</span>
                        <check-box ?checked=${renderer.showGrid} @change=${(e) => { renderer.showGrid = e.target.checked; }} 
                                    icon="visibility_off" active-icon="visibility"></check-box>
                    </div>
                </div>
                <div class="layers">
                    ${layers.map((layer, i) => {
                        const visChangeHandler = e => {
                            layer.hidden = !e.target.checked;
                        }
                        const guideChangeHandler = e => {
                            layer.guide = !e.target.checked;
                            window.temp = layer;
                        }
                        return html`
                            <div class="layer row" data-layer-index="${i}" ?selected=${this.focusedLayer == layer}>
                                <span class="title">${layer.name}</span>
                                <div class="buttons">
                                    <check-box ?checked=${!layer.hidden} @change=${visChangeHandler} 
                                        icon="visibility_off" active-icon="visibility"></check-box>
                                    <check-box ?checked=${!layer.guide} @change=${guideChangeHandler} 
                                        icon="info" active-icon="info"></check-box>
                                </div>
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

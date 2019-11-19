import { render, html } from 'lit-html';
import styles from './Components.css';

export class MapSelect extends HTMLElement {

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
            <style>
            
                .map-list {
                    display: grid;
                    grid-auto-flow: column;
                    grid-gap: 10px;
                    height: 100%;
                    padding: 10px;
                    box-sizing: border-box;
                }

                .map {
                    position: relative;
                    width: 220px;
                    height: 100%;
                    flex: none;
                    cursor: pointer;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: hidden;
                    transition: outline .025s ease-out;
                    outline: 2px solid transparent;
                    border-radius: 4px;
                }

                .map:focus,
                .map:active {
                    outline-color: white;
                }

                .map-title {
                    font-family: 'Roboto', 'Open-Sans', sans-serif;
                    font-size: 28px;
                    font-weight: 500;
                    position: absolute;
                    top: 80%;
                    width: 100%;
                    text-align: center;
                    white-space: pre-wrap;
                    text-shadow: 1px 2px 5px rgba(0, 0, 0, 0.25);
                    z-index: 1000;
                    background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.25), transparent);
                    padding: 5px 0;
                    line-height: 100%;
                }

                .map-thumbnail {
                    height: 100%;
                    transition: .15s ease-out;
                }

                .map:hover .map-thumbnail {
                    transform: scale(1.025) translate(0, -5px);
                }

            </style>
            <div class="map-list">
                <div class="map" tabIndex="0">
                    <span class="map-title">ar_shoots</span>
                    <img class="map-thumbnail" src="../res/ar_shoots_thumb.webp" />
                </div>
                <div class="map" tabIndex="1">
                    <span class="map-title">de_dust2</span>
                    <img class="map-thumbnail" src="../res/de_dust2_thumb.jpg" />
                </div>
            </div>
        `;
        render(template, this.shadowRoot);
    }

}

customElements.define('map-select', MapSelect);

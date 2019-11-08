import { render, html } from 'lit-html';
import './Icon.js';

class CheckBox extends HTMLElement {

    static get observedAttributes() { 
        return ['active-icon', 'icon', 'checked'];
    }

    get icon() {
        return this.getAttribute('icon');
    }

    get activeIcon() {
        return this.getAttribute('active-icon');
    }

    get checked() {
        return this.hasAttribute('checked') && this.getAttribute('checked') != "false";
    }

    set checked(value) {
        if(value === false) {
            this.removeAttribute('checked');
        } else if(value === true) {
            this.setAttribute('checked', value);
        }
    }

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
    }

    attributeChangedCallback() {
        this.render();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const clickHandler = () => {
            this.checked = !this.checked;
            this.dispatchEvent(new Event('change'));
        }
        const template = html`
            <style>
                :host {
                    border-radius: 2px;
                    padding: 2px;
                    cursor: pointer;
                }
                :host(:hover) {
                    background: hsla(0, 0%, 50%, 0.35);
                }
                :host(:active) {
                    background: hsla(0, 0%, 50%, 0.15);
                }
            </style>
            <div class="checkbox" @click=${clickHandler}>
                <mat-icon icon="${this.checked ? (this.activeIcon || this.icon) : this.icon}"></mat-icon>
            </div>
        `;
        render(template, this.shadowRoot);
    }
}

customElements.define('check-box', CheckBox);

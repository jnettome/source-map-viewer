export class Icon extends HTMLElement {

    static get observedAttributes() {
        return ['icon', 'size'];
    }

    get icon() {
        return this.getAttribute('icon');
    }

    set icon(value) {
        this.setAttribute('icon', value);
    }

    get size() {
        return this.getAttribute('size');
    }

    set size(value) {
        this.setAttribute('size', value);
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        const icon = this.shadowRoot.querySelector('i');
        if(icon) {
            icon.innerText = this.icon;
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
            <style>
                :host {
                    width: var(--icon-size, 14px);
                    height: var(--icon-size, 14px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .material-icons {
                    font-size: var(--icon-size, 14px);
                    display: block;
                    pointer-events: none;
                    width: 100%;
                    height: 100%;
                }
            </style>
            <i class="material-icons">${this.icon}</i>
        `;
    }

}

customElements.define('mat-icon', Icon);

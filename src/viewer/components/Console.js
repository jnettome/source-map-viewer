import { THConsole, THConsoleInput } from '@uncut/common-components/components/THConsole';
import { Logger } from '@uncut/viewport/src/Logger';

THConsoleInput.template = () => {
    return `
        <style>
            :host {
                display: none;
            }

            .console-input {
                opacity: 0.75;
            }

            input {
                width: 100%;
                border: none;
                margin: 0;
                padding: 8px 10px;
                border-top-right-radius: 3px;
                border-bottom-right-radius: 3px;
                background: rgba(0, 0, 0, 0.15);
                outline: none;
                color: white;
                box-sizing: border-box;
            }
        </style>
        <div class="console-input">
            <input id="consoleInput" type="text" autocomplete="false" spellcheck="false"/>
        </div>
    `;
}

export class DebugConsole extends THConsole {

    constructor() {
        super();

        const consoleinfo = console.info;
        const consolelog = console.log;
        const consoleerror = console.error;
        const consolewarn = console.warn;

        const log = data => {
            this.log(
                `<span style="${data.style.prefix}">${data.prefix}</span>`, 
                `<span style="${data.style.text}">${data.text}</span>`,
            );
        }

        Logger.listen('Renderer', log);
        Logger.listen('Resources', log);

        console.log = (...args) => {
            this.log(...args);
            consolelog(...args);
        };

        console.error = (...args) => {
            this.error(...args);
            consoleerror(...args);
        };
    }

}

customElements.define('debug-console', DebugConsole);

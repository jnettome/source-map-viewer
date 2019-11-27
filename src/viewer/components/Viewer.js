import Viewport from '@uncut/viewport/components/Viewport';
import Console from '@uncut/viewport/components/Console';
import { PlayerControler } from '@uncut/viewport/src/controlers/PlayerControler';
import { MapLoader } from '../MapLoader';

export class SourceViewer extends Viewport {

    constructor() {
        super({ controllertype: PlayerControler });
        
        this.renderer.clearPass = false;
        this.renderer.options = {
			CULL_FACE: false,
		}

        this.enableCameraSaveState();
        this.enableSelecting();
        this.loadMap();        
    }

    loadMap() {
        MapLoader.load().then(level => {
            this.scene = level;
            level.add(this.camera);
        })
    }

    enableSelecting() {
        super.enableSelecting();

        this.addEventListener('select', () => {
            const outliner = document.querySelector('viewer-controls');
            outliner.focusLayer(this.cursor.parent);
        });
    }

}

customElements.define('source-map-viewer', SourceViewer);

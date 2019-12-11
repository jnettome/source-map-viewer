import Viewport from '@uncut/viewport/components/Viewport';
import Console from '@uncut/viewport/components/Console';
import { PlayerControler } from '@uncut/viewport/src/controlers/PlayerControler';
import { MapLoader } from '../MapLoader';
import { Task } from '@uncut/viewport/src/Scheduler';

export class SourceViewer extends Viewport {

    constructor() {
        super();
        
        this.renderer.clearPass = false;
        this.renderer.options = {
			CULL_FACE: false,
        }

        this.enableCameraSaveState();
        this.enableSelecting();
        this.loadMap();   
        
        const playerCtrler = new PlayerControler(this);

		this.scheduler.addTask(new Task(() => {
			playerCtrler.update();
		}));     
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

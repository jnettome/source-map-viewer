import Viewport from '@uncut/viewport/components/Viewport';
import { MapLoader } from '../MapLoader';
import { PlayerControler } from '@uncut/viewport/src/controlers/PlayerControler';
import { ProgressBar } from './Progressbar';

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
        // const progressbar = new ProgressBar(MapLoader.progress);
        // document.body.appendChild(progressbar);

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

    enableCameraSaveState() {
        const lastCamPos = localStorage.getItem('camera');
        const cam = JSON.parse(lastCamPos);
        
        if(cam && cam.position && cam.rotation) {
            this.camera.position.x = cam.position[0];
            this.camera.position.y = cam.position[1];
            this.camera.position.z = cam.position[2];
            this.camera.rotation.x = cam.rotation[0];
            this.camera.rotation.y = cam.rotation[1];
            this.camera.rotation.z = cam.rotation[2];
        }

        setInterval(() => {
            localStorage.setItem('camera', JSON.stringify({
                position: this.camera.position,
                rotation: this.camera.rotation,
            }));
        }, 300);
    }

}

customElements.define('source-map-viewer', SourceViewer);

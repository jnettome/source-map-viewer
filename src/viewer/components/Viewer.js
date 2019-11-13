import Viewport from '@uncut/viewport/components/Viewport';
import Config from '@uncut/viewport/src/Config';
import { MapLoader } from '../core/MapLoader';
import { PlayerControler } from '@uncut/viewport/src/controlers/PlayerControler';

Config.global.setValue('show.grid', false);
Config.global.setValue('debug', false);

const canvas = document.createElement('canvas');
const offscreen = canvas.transferControlToOffscreen();

export class SourceViewer extends Viewport {

    constructor() {
        super({
            controllertype: PlayerControler,
            offscreen: offscreen,
            canvas: canvas,
        });
        
        this.renderer.debug = false;
        this.renderer.clearPass = false;

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

        MapLoader.load().then(level => {
            this.scene = level;
            level.add(this.camera);
        })

        this.enableSelecting();
    }

}

customElements.define('source-map-viewer', SourceViewer);

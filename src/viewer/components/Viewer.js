import Viewport from '@uncut/viewport/components/Viewport';
import Config from '@uncut/viewport/src/Config';
import { MapLoader } from '../core/MapLoader';
import { PlayerControler } from '@uncut/viewport/src/controlers/PlayerControler';

Config.global.setValue('show.grid', false);
Config.global.setValue('debug', false);

export class SourceViewer extends Viewport {

    get mapinfo() {
        return this.scene.mapinfo || {};
    }

    constructor() {
        super(PlayerControler);
        
        this.renderer.debug = true;

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

        // setInterval(() => {
        //     const light = this.scene.lightsource;
        //     if(light) {
        //         light.rotation.y = performance.now() / 1000;
        //     }
        // }, 16);

        MapLoader.load().then(level => {
            this.scene = level;
            level.add(this.camera);
            // this.minimap();
        })
    }

    minimap() {
        const minimap = new Viewport();
        minimap.scene = this.scene;
        minimap.camera = minimap.scene.lightsource;
        minimap.style.position = "fixed";
        minimap.style.left = "10px";
        minimap.style.top = "10px";
        minimap.style.width = "180px";
        minimap.style.height = "180px";

        minimap.renderer.setResolution(180, 180);

        this.parentNode.appendChild(minimap);
    }

}

customElements.define('source-map-viewer', SourceViewer);

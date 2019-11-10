import Viewport from '@uncut/viewport/components/Viewport';
import Config from '@uncut/viewport/src/Config';
import { MapLoader } from '../core/MapLoader';

Config.global.setValue('show.grid', false);
Config.global.setValue('debug', false);

export class SourceViewer extends Viewport {

    get mapinfo() {
        return this.scene.mapinfo || {};
    }

    constructor() {
        super();
        
        this.renderer.debug = true;

        // setInterval(() => {
        //     const light = this.scene.lightsource;
        //     if(light) {
        //         light.rotation.y = performance.now() / 1000;
        //     }
        // }, 16);

        MapLoader.load().then(level => {
            this.scene = level;
            level.add(this.camera);
            this.loaded();
        })
    }

    loaded() {
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

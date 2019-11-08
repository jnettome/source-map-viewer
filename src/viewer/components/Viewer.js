import Viewport from '@uncut/viewport/components/Viewport';
import Config from '@uncut/viewport/src/Config';
import { Resources } from '@uncut/viewport/src/Resources';
import { Loader } from '@uncut/viewport/src/Loader';
import { Geometry } from '@uncut/viewport/src/scene/Geometry';
import DefaultMaterial from '@uncut/viewport/src/materials/DefaultMaterial';

Config.global.setValue('show.grid', false);
Config.global.setValue('debug', false);

Resources.add({
    'map': 'map_tri.obj'
});

export class SourceViewer extends Viewport {

    constructor() {
        super();

        this.mapinfo = {
            name: 'de_dust2',
        }

        this.addEventListener('load', () => {
            const mapObj = Resources.get('map');
            const verts = Loader.loadObjFile(mapObj);

            const geo = new Geometry({
                vertecies: verts,
                material: new DefaultMaterial(),
                scale: 1,
                rotation: [0, 0, 0],
                position: [0, 0, 0],
            });

            this.scene.add(geo);
        })  
    }

    connectedCallback() {
        super.connectedCallback();

        const minimap = new Viewport();
        minimap.scene = this.scene;
        minimap.camera = minimap.scene.lightsource;
        minimap.style.position = "fixed";
        minimap.style.left = "10px";
        minimap.style.bottom = "10px";
        minimap.style.width = "150px";
        minimap.style.height = "150px";

        minimap.renderer.setResolution(150, 150);

        this.parentNode.appendChild(minimap);
    }

}

customElements.define('source-map-viewer', SourceViewer);

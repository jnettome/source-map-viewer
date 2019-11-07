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

        this.addEventListener('load', () => {
            const mapObj = Resources.get('map');
            const verts = Loader.loadObjFile(mapObj);

            const geo = new Geometry({
                vertecies: verts,
                material: new DefaultMaterial(),
                scale: 40,
            });

            this.scene.add(geo);
        })  
    }

}

customElements.define('source-map-viewer', SourceViewer);

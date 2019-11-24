import { Scene } from '@uncut/viewport/src/scene/Scene';
import { Model } from './Model';

export class Level extends Scene {

    constructor() {
        super();

        this.loadLevel('ar_shoots');
    }

    loadLevel(mapName) {
        const model = new Model();
        const oldObjects = [...this.objects];
        this.objects = model.geometry;
        model.geometry.add(...oldObjects);
        model.loadMap(mapName);
    }

}

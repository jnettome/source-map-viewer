import { Scene } from '@uncut/viewport/src/scene/Scene';
import { Model } from './Model';

export class Level extends Scene {

    constructor() {
        super();

        this.loadLevel('ar_shoots');
    }

    loadLevel(mapName) {
        const model = new Model();
        this.objects = model.geometry;
        model.loadMap(mapName);
    }

}

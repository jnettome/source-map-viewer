import { Cube } from '@uncut/viewport/src/geo/Cube';
import { Loader } from '@uncut/viewport/src/Loader';
import DefaultMaterial from '@uncut/viewport/src/materials/DefaultMaterial';
import MattMaterial from '@uncut/viewport/src/materials/MattMaterial';
import PointMaterial from '@uncut/viewport/src/materials/PointMaterial';
import { Texture } from '@uncut/viewport/src/materials/Texture';
import { Resources } from '@uncut/viewport/src/Resources';
import { Geometry } from '@uncut/viewport/src/scene/Geometry';
import { Scene } from '@uncut/viewport/src/scene/Scene';
import BSPFile from 'source-bsp-lib/src/BSPFile';

const res = {
    't_model': 't_model.obj',
    't_model_tex': 't_leet.png',
    'skybox_sphere': 'skybox_sphere.obj',
    'skybox': 'skybox.png',
};

Resources.add(res);

export class BSPLevel extends Scene {

    constructor() {
        super();

        Resources.load().finally(() => {
            this.loadBspMap();
        })
    }

    loadBspMap() {
        fetch('../res/maps/ar_shoots.bsp').then(async res => {
            const arrayBuffer = await res.arrayBuffer();
            const bsp = BSPFile.fromDataArray(arrayBuffer);

            const vertexData = Loader.loadBspFile(bsp);

            const geo = new Geometry({
                vertecies: vertexData.vertecies,
                indecies: vertexData.indecies,
                material: new DefaultMaterial(),
                scale: 0.01,
                rotation: [0, 0, 0],
                position: [0, 0, 0],
            });

            this.add(geo);

        });
    }

}
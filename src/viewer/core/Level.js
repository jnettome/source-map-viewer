import { Resources } from '@uncut/viewport/src/Resources';
import { Loader } from '@uncut/viewport/src/Loader';
import { Geometry } from '@uncut/viewport/src/scene/Geometry';
import DefaultMaterial from '@uncut/viewport/src/materials/DefaultMaterial';
import { Texture } from '@uncut/viewport/src/materials/Texture';
import { Cube } from '@uncut/viewport/src/geo/Cube';
import { GameState } from '../core/Gamestate';
import { Guide } from '@uncut/viewport/src/geo/Guide';
import MattMaterial from '@uncut/viewport/src/materials/MattMaterial';
import { Scene } from '@uncut/viewport/src/scene/Scene';

const res = {
    'map': 'de_dust2.obj',
    't_model': 't_model.obj',
    't_model_tex': 't_leet.png',
    'skybox_sphere': 'skybox_sphere.obj',

    'skybox': 'skybox.png',
};

for(let i = 0; i < 33; i++) {

    if(i == 19 || i == 24) {
        continue;
    }

    res['material_' + i] = `textures/de_dust2_material_${i}.png`;
}

Resources.add(res);

const gamestate = new GameState();

export class Level extends Scene {

    constructor() {
        super();
        
        this.mapinfo = {
            name: 'de_dust2',
        }

        Resources.load().finally(() => {
            this.build();
        })
    }

    build() {
        const map = Resources.get('map');

        const geo = new Geometry({
            vertecies: Loader.loadObjFile(map),
            materials: map.materials.map(mat => {
                const matIndex = mat.match(/[0-9+]/g)[0];
                const img = Resources.get("material_" + matIndex);
                const tex = new Texture(img);
                return new DefaultMaterial({
                    specular: 0,
                    texture: tex,
                });
            }),
            scale: 0.01,
            rotation: [0, 0, 0],
            position: [0, 0, 0],
        });

        const skybox = new Geometry({
            vertecies: Loader.loadObjFile(Resources.get('skybox_sphere')),
            material: new MattMaterial({
                specular: 0,
                texture: new Texture(Resources.get('skybox'))
            }),
            selectable: false,
            scale: -600,
            rotation: [0, 0, 0],
        });

        this.add(skybox);
        this.add(geo);

        this.add(new Cube({
            position: [1, 0.4, 0],
            rotation: [0.75, 1, 0],
            material: new DefaultMaterial(),
            scale: 0.5,
        }))

        this.add(new Cube({
            position: [-1, 0.8, 0],
            rotation: [0.75, -2, 0],
            material: new DefaultMaterial(),
            scale: 0.5,
        }))

        this.showPlayers();
    }

    showPlayers() {
        
        const playerObjects = new Map();
        
        const t_verts = Loader.loadObjFile(Resources.get('t_model'));
        const t_tex = new Texture(Resources.get('t_model_tex'));

        gamestate.onData = data => {
            const players = data.allplayers;

            for(let [p, geo] of playerObjects) {
                if(!(p in players)) {
                    this.remove(geo);
                    playerObjects.delete(geo);
                }
            }

            for(let key in players) {

                const player = players[key];
                let pos = player.position.split(', ').map(n => parseFloat(n) / 100);
                pos = [ pos[0], pos[2], -pos[1] ];

                let geo = null;

                let rot = player.forward.split(', ').map(n => parseFloat(n));

                if(playerObjects.has(key)) {
                    geo = playerObjects.get(key);
                    geo.position.x = pos[0];
                    geo.position.y = pos[1];
                    geo.position.z = pos[2];

                    // not rotation (rot)
                    geo.rotation.y = rot[1];

                } else {
                    geo = new Geometry({ 
                        vertecies: t_verts,
                        scale: 15,
                        material: new DefaultMaterial({
                            specular: 0,
                            texture: t_tex,
                            diffuseColor: [1, 0, 0, 1]
                        })
                    });
                    geo.position.x = pos[0];
                    geo.position.y = pos[1];
                    geo.position.z = pos[2];

                    this.add(geo);
                    playerObjects.set(key, geo);
                }
            }
        }
    }

}
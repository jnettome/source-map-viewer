import Viewport from '@uncut/viewport/components/Viewport';
import Config from '@uncut/viewport/src/Config';
import { Resources } from '@uncut/viewport/src/Resources';
import { Loader } from '@uncut/viewport/src/Loader';
import { Geometry } from '@uncut/viewport/src/scene/Geometry';
import DefaultMaterial from '@uncut/viewport/src/materials/DefaultMaterial';
import { Texture } from '@uncut/viewport/src/materials/Texture';
import { Cube } from '@uncut/viewport/src/geo/Cube';
import { GameState } from '../core/Gamestate';
import { Guide } from '@uncut/viewport/src/geo/Guide';

Config.global.setValue('show.grid', false);
Config.global.setValue('debug', false);

Resources.add({
    'map': 'de_dust2.obj',
    'map_tex': 'JERU_WALL_STONE_03_DIFFUSEMAP.jpg',
    'skybox': 'Jungle_csgo.jpg',
    't_model': 't_model.obj',
    't_model_tex': 't_leet.png',
    'skybox_sphere': 'skybox_sphere.obj'
});

const gamestate = new GameState();

export class SourceViewer extends Viewport {

    constructor() {
        super();

        this.mapinfo = {
            name: 'de_dust2',
        }

        this.addEventListener('load', () => {

            const geo = new Geometry({
                vertecies: Loader.loadObjFile(Resources.get('map')),
                material: new DefaultMaterial({
                    specular: 0,
                    texture: new Texture(Resources.get('map_tex'))
                }),
                scale: 0.01,
                rotation: [0, 0, 0],
                position: [0, 0, 0],
            });

            const skybox = new Geometry({
                vertecies: Loader.loadObjFile(Resources.get('skybox_sphere')),
                material: new DefaultMaterial({
                    specular: 0,
                    texture: new Texture(Resources.get('skybox'))
                }),
                scale: -800,
                rotation: [0, 0, 0],
            });

            this.scene.add(geo);
            this.scene.add(skybox);

            this.showPlayers();
        })
    }

    showPlayers() {
        
        const playerObjects = new Map();
        
        const t_verts = Loader.loadObjFile(Resources.get('t_model'));
        const t_tex = new Texture(Resources.get('t_model_tex'));

        gamestate.onData = data => {
            const players = data.allplayers;

            for(let [p, geo] of playerObjects) {
                if(!(p in players)) {
                    this.scene.remove(geo);
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

                    this.scene.add(geo);
                    playerObjects.set(key, geo);
                }
            }
        }
    }

    connectedCallback() {
        super.connectedCallback();

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

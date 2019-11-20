import { Cube } from '@uncut/viewport/src/geo/Cube';
import { Loader } from '@uncut/viewport/src/Loader';
import DefaultMaterial from '@uncut/viewport/src/materials/DefaultMaterial';
import MattMaterial from '@uncut/viewport/src/materials/MattMaterial';
import PointMaterial from '@uncut/viewport/src/materials/PointMaterial';
import { Texture } from '@uncut/viewport/src/materials/Texture';
import { Resources } from '@uncut/viewport/src/Resources';
import { Geometry } from '@uncut/viewport/src/scene/Geometry';
import { Scene } from '@uncut/viewport/src/scene/Scene';
import { Group } from '@uncut/viewport/src/geo/Group';
import { Plane } from '@uncut/viewport/src/geo/Plane';
import BSPFile from 'source-bsp-lib/src/BSPFile.js';
import MDLFile from 'source-bsp-lib/src/MDLFile.js';
import VVDFile from 'source-bsp-lib/src/VVDFile.js';
import VPKFile from 'source-bsp-lib/src/VPKFile.js';
import * as Comlink from "comlink";
import { MapLoader } from './MapLoader';

const worker = new Worker("worker.js");
const SourceDecoder = Comlink.wrap(worker);

export class BSPLevel extends Scene {

    get progress() {
        return MapLoader.progress;
    }

    constructor() {
        super();

        this.propTypes = new Map();

        Resources.load().finally(() => {
            this.loadBspMap();
        })
    }

    registerProp(prop) {
        if(prop.PropType)
        if(!this.propTypes.has(prop.PropType)) {
            this.propTypes.set(prop.PropType, {
                mdlPath: prop.PropType,
                vvdPath: prop.PropType.replace('.mdl', '.vvd'),
                listeners: [],
            });
        }
    }

    getPropType(prop) {
        return prop.PropType;
    }

    static loadBspFile(meshData) {

        const vertexData = {
            vertecies: meshData.vertecies.map(vert => ([
                ...vert.vertex,
                ...vert.uv,
                ...vert.normal
            ])).flat(),
            indecies: meshData.indecies
        };
        
        const geometry = [];

        // enitites
        // const entityMaterial = new DefaultMaterial();
        // const entityGroup = new Group();
        // entityGroup.name = "Entities";
        // for(let entity of bspFile.entities) {
        //     if(entity.origin && entity.angles) {
        //         entityGroup.add(new Plane({
        //             material: entityMaterial,
        //             position: [
        //                 entity.origin[0] * -0.01,
        //                 entity.origin[2] * 0.01,
        //                 entity.origin[1] * 0.01,
        //             ],
        //             rotation: [
        //                 entity.angles[0] * Math.PI / 180,
        //                 entity.angles[2] * Math.PI / 180,
        //                 entity.angles[1] * Math.PI / 180,
        //             ],
        //             scale: [0.2, 0.2, 0.2],
        //         }));
        //     }
        // }
        // geometry.push(entityGroup);

        const map = new Geometry({
            vertecies: vertexData.vertecies,
            indecies: vertexData.indecies,
            material: new DefaultMaterial(),
            scale: [-0.01, 0.01, 0.01],
            rotation: [0, 0, 0],
            position: [0, 0, 0],
        });
        map.name = "World";

        geometry.push(map);

        return geometry;
    }

    async loadBspMap() {
        
        this.progress.addSteps(5);
        this.progress.message("Loading level");

        const startTime = performance.now();

        const bsp = await SourceDecoder.loadMap('../res/maps/ar_shoots.bsp');

        this.progress.clearSteps(5);

        const props = bsp.bsp.gamelumps.sprp;
        
        this.progress.addSteps(props.length);

        this.progress.message('Level decoded in', (performance.now() - startTime).toFixed(2), 'ms');

        const geo = BSPLevel.loadBspFile(bsp.meshData);
        this.add(geo);
        
        this.progress.message("Level loaded");

        this.progress.message("Loading props");

        const singlePropMaterial = new DefaultMaterial();

        for(let prop of props) {
            this.registerProp(prop);

            const type = this.propTypes.get(this.getPropType(prop));

            type.listeners.push(meshData => {
                this.progress.clearSteps(1);

                if(!meshData) return;

                const propGeometry = new Geometry({
                    vertecies: meshData.vertecies.flat(),
                    indecies: meshData.indecies,
                    material: singlePropMaterial,
                    scale: [-0.01, 0.01, 0.01],
                    position: [
                        prop.Origin.data[0].data * -0.01,
                        prop.Origin.data[2].data * 0.01,
                        prop.Origin.data[1].data * 0.01,
                    ],
                    rotation: [
                        prop.Angles.data[0].data * Math.PI / 180,
                        prop.Angles.data[1].data * Math.PI / 180,
                        prop.Angles.data[2].data * Math.PI / 180,
                    ],
                });
                const parts = prop.PropType.split('/');
                propGeometry.name = parts[parts.length-1];
                
                this.add(propGeometry);
            });
        }

        const propCount = this.propTypes.size;
        let propCounter = this.propTypes.size;

        for(let [_, propType] of this.propTypes) {
            this.loadStaticProp(propType).then(meshData => {
                for(let listener of propType.listeners) {
                    listener(meshData);
                }

                propCounter--;
                this.progress.message(`Loaded prop ${propCount - propCounter} of ${propCount}`);

                if(propCounter == 0) {
                    this.progress.message(`Props loaded`);
                }
            });
        }
    }

    async loadStaticProp(propType) {
        return SourceDecoder.loadProp(`../res/${propType.vvdPath}`);
    }

}
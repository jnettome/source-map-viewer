import DefaultMaterial from '@uncut/viewport/src/materials/DefaultMaterial';
import { Texture } from '@uncut/viewport/src/materials/Texture';
import { Geometry } from '@uncut/viewport/src/scene/Geometry';
import { Scene } from '@uncut/viewport/src/scene/Scene';
import * as Comlink from "comlink";
import VTFFile from 'source-bsp-lib/src/VTFFile.js';
import VMTFile from 'source-bsp-lib/src/VMTFile.js';
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

        this.loadBspMap();
        // this.loadPropExample();
    }

    loadPropExample() {
        this.progress.addSteps(5);
        this.progress.message("Loading props");

        SourceDecoder.loadProp(`../res/models/props/gg_vietnam/oilbarrels.mdl`).then(meshData => {

            if(!meshData) {
                console.error('No Prop');
                return;
            }

            const propGeometry = new Geometry({
                vertecies: meshData.vertecies.flat(),
                indecies: meshData.indecies,
                material: new DefaultMaterial(),
                scale: [-0.1, 0.1, 0.1],
                position: [ 0, 0, 0 ],
                rotation: [ 0, 0, 0 ],
            });
            propGeometry.name = "Example Prop";
            
            this.add(propGeometry);

            this.progress.clearSteps(5);
        })
    }

    // map from here

    async loadBspMap() {
        
        this.progress.addSteps(5);
        this.progress.message("Loading level");

        const startTime = performance.now();

        const bsp = await SourceDecoder.loadMap('../res/maps/ar_shoots.bsp');

        const props = bsp.bsp.gamelumps.sprp;
        const geo = await this.loadBspFile(bsp);
        this.add(geo);

        // return;
        
        this.progress.addSteps(props.length);
        this.progress.clearSteps(5);

        this.progress.message('Level decoded in', (performance.now() - startTime).toFixed(2), 'ms');
        
        this.progress.message("Level loaded");
        this.progress.message("Loading props");

        const single = new DefaultMaterial();

        for(let prop of props) {
            this.registerProp(prop);

            const type = this.propTypes.get(this.getPropType(prop));

            type.listeners.push(propData => {
                this.progress.clearSteps(1);

                const texture = propData.texture;
                const meshData = propData.meshData;

                if(!meshData) return;

                const mat = () => {
                    const mat = {
                        diffuseColor: [Math.random(), Math.random(), Math.random(), 1],
                    };
                    const vtf = propData.texture;
                    if(vtf) {
                        mat.texture = new Texture(vtf.imageData, vtf.format);
                    }
    
                    return new DefaultMaterial(mat);
                }

                const propGeometry = new Geometry({
                    vertecies: meshData.vertecies.flat(),
                    indecies: meshData.indecies,
                    material: mat(),
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
            this.loadStaticProp(propType).then(p => {

                for(let listener of propType.listeners) {
                    listener(p);
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
        return SourceDecoder.loadProp(propType.mdlPath);
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

    async loadMapTextures(textureArray) {
        return new Promise(async (resolve, reject) => {
            const textures = new Map();
            
            for(let texture of textureArray) {
                const vmt = await fetch(`../res/materials/${texture.toLocaleLowerCase()}.vmt`).then(async res => {
                    if(res.status == 200) {
                        const dataArray = await res.arrayBuffer();
                        return VMTFile.fromDataArray(dataArray);
                    }
                });

                if(vmt && vmt.data.lightmappedgeneric) {
                    const materialTexture = vmt.data.lightmappedgeneric['$basetexture'];

                    if(materialTexture) {
                        await fetch(`../res/materials/${materialTexture.toLocaleLowerCase()}.vtf`).then(async res => {
                            if(res.status == 200) {
                                const dataArray = await res.arrayBuffer();
                                const vtf = VTFFile.fromDataArray(dataArray);
                                
                                textures.set(texture, vtf);
                            }
                        });
                    }
                }
                if(vmt && vmt.data.worldvertextransition) {
                    const materialTexture = vmt.data.worldvertextransition['$basetexture'];

                    if(materialTexture) {
                        await fetch(`../res/materials/${materialTexture.toLocaleLowerCase()}.vtf`).then(async res => {
                            if(res.status == 200) {
                                const dataArray = await res.arrayBuffer();
                                const vtf = VTFFile.fromDataArray(dataArray);
                                
                                textures.set(texture, vtf);
                            }
                        });
                    }
                }

                if(!textures.has(texture)) {
                    console.warn('Missing texture', texture);
                }
            }
            resolve(textures);
        })
    }

    async loadBspFile(bsp) {

        // enitites
        // for(let entity of bsp.bsp.entities) {
        //     if(entity.origin && entity.angles) {
        //         this.add(new Plane({
        //             material: new DefaultMaterial(),
        //             position: [
        //                 entity.origin[0] * -0.01,
        //                 entity.origin[2] * 0.01,
        //                 entity.origin[1] * 0.01,
        //             ],
        //             rotation: [
        //                 entity.angles[1] * Math.PI / 180,
        //                 entity.angles[2] * Math.PI / 180,
        //                 entity.angles[0] * Math.PI / 180,
        //             ],
        //             scale: [0.2, 0.2, 0.2],
        //         }));
        //     }
        // }

        const textures = await this.loadMapTextures(bsp.bsp.textures);

        // world
        const meshData = bsp.meshData;

        const vertexData = {
            vertecies: meshData.vertecies.map(vert => ([
                ...vert.vertex,
                vert.uv[0], vert.uv[1], vert.uv[2], // <-- textureIndex
                ...vert.normal
            ])).flat(),
            indecies: meshData.indecies
        };
        
        const geometry = [];

        const map = new Geometry({
            vertecies: vertexData.vertecies,
            indecies: vertexData.indecies,
            materials: meshData.textures.map(tex => {
                const mat = {
                    diffuseColor: [Math.random(), Math.random(), Math.random(), 1],
                };
                const vtf = textures.get(tex);
                if(vtf) {
                    mat.texture = new Texture(vtf.imageData, vtf.format);
                }

                return new DefaultMaterial(mat);
            }),
            scale: [-0.01, 0.01, 0.01],
            rotation: [0, 0, 0],
            position: [0, 0, 0],
        });
        map.name = "World";

        geometry.push(map);

        return geometry;
    }

}
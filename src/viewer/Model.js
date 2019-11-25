import DefaultMaterial from '@uncut/viewport/src/materials/DefaultMaterial';
import { Geometry } from '@uncut/viewport/src/scene/Geometry';
import * as Comlink from "comlink";
import { VMTFile, VTFFile } from 'source-bsp-lib';
import { Texture } from '@uncut/viewport/src/materials/Texture';
import { Progress } from './Progress';
import { ProgressBar } from './components/Progressbar';
import { Group } from '@uncut/viewport/src/geo/Group';

const worker = new Worker("worker.js");
const SourceDecoder = Comlink.wrap(worker);

const propTypes = new Map();

const directories = {
    maps: ['/maps'],
    models: ['/models'],
    materials: ['/materials/models', '/materials'],
}

const target_folders = [ "materials", "models", "particles", "scenes" ];
const file_types = [ "vmt", "vtf", "mdl", "phy", "vtx", "vvd", "pcf" ];

const prog = new Progress();
prog.addSteps(5);

const progressbar = new ProgressBar(prog);
document.body.appendChild(progressbar);

export class Model {

    static async getMap(mapName) {
        return SourceDecoder.loadMap('../res/maps/' + mapName + '.bsp');
    }

    static async getProp(propName) {
        return SourceDecoder.loadProp('../res/models/' + propName + '.mdl');
    }

    constructor() {
        this.propGeometry = new Group();
        this.geometry = new Set();

        this.geometry.add(this.propGeometry);
    }

    loadPropExample(propName = 'gg_vietnam/palm_a_cluster_b.mdl') {
        return SourceDecoder.loadProp(`./models/props/${propName}`).then(propData => {

            const mat = () => {
                if(propData.texture) {
                    return new DefaultMaterial({
                        diffuseColor: [0, 0, 0, 0],
                        texture: new Texture(propData.texture.imageData, propData.texture.format)
                    });
                } else {
                    return new DefaultMaterial();
                }
            }

            const propGeometry = new Geometry({
                vertecies: propData.vertecies.flat(),
                indecies: propData.indecies,
                material: mat(),
                scale: [-0.01, 0.01, 0.01],
            });

            this.propGeometry.add(propGeometry);
            this.propGeometry.uid = Date.now().toString();
        })
    }
    
    registerProp(prop) {
        if(prop.PropType)
        if(!propTypes.has(prop.PropType)) {
            propTypes.set(prop.PropType, {
                mdlPath: prop.PropType,
                vvdPath: prop.PropType.replace('.mdl', '.vvd'),
                listeners: [],
            });
        }
    }

    getPropType(prop) {
        return prop.PropType;
    }

    loadTextures(textureArray) {
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

    async loadMap(mapName) {

        prog.message('Loading map.');

        const bsp = await Model.getMap(mapName);

        prog.clearSteps(4);

        prog.message('Loading textures.');

        const textures = await this.loadTextures(bsp.bsp.textures);

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

        prog.message('Loading props.');

        this.loadMapProps(bsp.bsp.gamelumps.sprp);
        
        const map = new Geometry({
            vertecies: vertexData.vertecies,
            indecies: vertexData.indecies,
            materials: meshData.textures.map(tex => {
                const mat = {};
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

        this.geometry.add(map);

        prog.clearSteps(1);
    }

    async loadMapProps(props) {
        const propCount = props.length;

        let propCounter = 0;

        prog.addSteps(propCount);

        for(let prop of props) {

            this.registerProp(prop);

            const type = propTypes.get(this.getPropType(prop));

            type.listeners.push(propData => {
                const mat = () => {
                    if(propData.texture) {
                        return new DefaultMaterial({
                            diffuseColor: [0, 0, 0, 0],
                            texture: new Texture(propData.texture.imageData, propData.texture.format)
                        });
                    } else {
                        return new DefaultMaterial();
                    }
                }

                const propGeometry = new Geometry({
                    vertecies: propData.vertecies.flat(),
                    indecies: propData.indecies,
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
                
                this.geometry.add(propGeometry);
                
                // this.propGeometry.add(propGeometry);
                // this.propGeometry.uid = Date.now().toString();

                prog.clearSteps(1);

                propCounter++;
                prog.message(`Loaded prop ${propCounter} of ${propCount}`);
            });
        }

        for(let [_, propType] of propTypes) {
            SourceDecoder.loadProp(propType.mdlPath).then(p => {
                for(let listener of propType.listeners) {
                    listener(p);
                }
            }).catch(err => {
                prog.clearSteps(propType.listeners.length);
            })
        }
    }

}

import * as Comlink from "comlink";

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

export class Model {

    static async getMap(mapName) {
        return SourceDecoder.loadMap('../res/maps/' + mapName + '.bsp');
    }

    static async getProp(propName) {
        return SourceDecoder.loadProp('../res/models/' + propName + '.mdl');
    }

    constructor() {

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
        const bsp = Model.getMap(mapName);

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

    loadMapProps(mapName) {
        const single = new DefaultMaterial();

        for(let prop of props) {
            this.registerProp(prop);

            const type = propTypes.get(this.getPropType(prop));

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

        const propCount = propTypes.size;
        let propCounter = propTypes.size;

        for(let [_, propType] of propTypes) {
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

    loadProp(propName) {



    }

}
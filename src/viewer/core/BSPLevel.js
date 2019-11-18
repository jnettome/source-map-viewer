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

const res = {
    'skybox_sphere': 'skybox_sphere.obj',
    'skybox': 'skybox.png',
};

Resources.add(res);

const singlePropMaterial = new DefaultMaterial();

export class BSPLevel extends Scene {

    static loadBspFile(bspFile) {

        const meshData = bspFile.convertToMesh();

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

        // props
        // const propsMaterial = new DefaultMaterial();
        // const propsGroup = new Group();
        // propsGroup.name = "Props";

        // for(let prop of bspFile.gamelumps.sprp) {
        //     if(prop.Origin) {
        //         propsGroup.add(new Plane({
        //             material: propsMaterial,
        //             position: [
        //                 prop.Origin[0] * -0.01,
        //                 prop.Origin[2] * 0.01,
        //                 prop.Origin[1] * 0.01,
        //             ],
        //             scale: [0.2, 0.2, 0.2],
        //         }));
        //     }
        // }
        // geometry.push(propsGroup);

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

    constructor() {
        super();

        Resources.load().finally(() => {
            this.loadBspMap();
        })
    }

    async loadBspMap() {
        fetch('../res/maps/ar_shoots.bsp').then(async res => {
            const arrayBuffer = await res.arrayBuffer();
            const bsp = BSPFile.fromDataArray(arrayBuffer);

            const geo = BSPLevel.loadBspFile(bsp);
            this.add(geo);

            const props = bsp.gamelumps.sprp.slice(0, 10);

            const propCount = props.length;
            let propCounter = props.length;
            let propSkipCounter = 0;

            for(let prop of props) {
                console.log('Loading prop', prop.PropType);

                this.loadStaticProp(prop).then(geo => {
                    if(!geo) {
                        propSkipCounter++;
                    } else {
                        this.add([geo]);
                    }
                    propCounter--;
                    console.log(`Loaded prop ${propCount - propCounter} of ${propCount}`);

                    if(propCounter == 0) {
                        console.log(`Skipped ${propSkipCounter} props.`);
                    }
                });
            }
        });
    }

    async loadStaticProp(prop) {
        // mdl
        // fetch('../res/' + propType).then(async res => {
        //     const arrayBuffer = await res.arrayBuffer();

        //     if(res.status !== 200) return;

        //     const mdl = MDLFile.fromDataArray(arrayBuffer);

        //     const bounds_min = mdl.header.hull_min;
        //     const bounds_max = mdl.header.hull_max;

        //     this.add(new Cube({
        //         material: propsMaterial,
        //         position: [
        //             prop.Origin[0] * -0.01,
        //             prop.Origin[2] * 0.01,
        //             prop.Origin[1] * 0.01,
        //         ],
        //         rotation: [
        //             prop.Angles[0] * Math.PI / 180,
        //             prop.Angles[2] * Math.PI / 180,
        //             prop.Angles[1] * Math.PI / 180,
        //         ],
        //         scale: [0.2, 0.2, 0.2],
        //     }));
        // });

        // vvd
        const propType = prop.PropType;

        return fetch(`../res/${propType.replace('.mdl', '.vvd')}`).then(async res => {
            const arrayBuffer = await res.arrayBuffer();

            if(res.status !== 200) return;

            const vvd = VVDFile.fromDataArray(arrayBuffer);

            const meshData = vvd.convertToMesh();

            const propGeometry = new Geometry({
                vertecies: meshData.vertecies.flat(),
                indecies: meshData.indecies,
                material: singlePropMaterial,
                scale: [-0.01, 0.01, 0.01],
                position: [
                    prop.Origin[0] * -0.01,
                    prop.Origin[2] * 0.01,
                    prop.Origin[1] * 0.01,
                ],
                rotation: [
                    prop.Angles[0] * Math.PI / 180,
                    prop.Angles[1] * Math.PI / 180,
                    prop.Angles[2] * Math.PI / 180,
                ],
            });
            const parts = prop.PropType.split('/');
            propGeometry.matrixAutoUpdate = false;
            propGeometry.name = parts[parts.length-1];

            return propGeometry;
        });
    }

}
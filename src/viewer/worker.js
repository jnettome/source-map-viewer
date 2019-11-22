import VVDFile from 'source-bsp-lib/src/VVDFile';
import BSPFile from 'source-bsp-lib/src/BSPFile';
import VPKFile from 'source-bsp-lib/src/VPKFile';
import MDLFile from 'source-bsp-lib/src/MDLFile';
import VMTFile from 'source-bsp-lib/src/VMTFile';
import VTFFile from 'source-bsp-lib/src/VTFFile';

importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");

const SourceDecoder = {
    loadMap(bspMapPath) {
        return fetch(bspMapPath).then(async res => {
            const arrayBuffer = await res.arrayBuffer();
            
            const bsp = BSPFile.fromDataArray(arrayBuffer);
            const meshData = bsp.convertToMesh();
            
            return {
                meshData,
                bsp,
            };
        })
    },
    loadVPK(vpkPath) {
        const load = async () => {
            const vpkFetch = await fetch(vpkPath);
            const vpkData = await vpkFetch.arrayBuffer();
            const vpk = VPKFile.fromDataArray(vpkData);
            return vpk;
        }
        return load();
    },
    async loadProp(propType) {

        const prop = {};

        // mdl
        const mdl = await fetch('../res/' + propType).then(async res => {
            if(res.status !== 200) return;
            
            const arrayBuffer = await res.arrayBuffer();
            const mdl = MDLFile.fromDataArray(arrayBuffer);

            return mdl;
        });

        const textures = [];

        const path = propType.split("/");
        path[path.length-1] = mdl.textures[0].name.data + ".vmt";
        const texPath = path.slice(1).join("/");

        const vmt = await fetch(`../res/materials/models/${texPath.toLocaleLowerCase()}`).then(async res => {
            if(res.status == 200) {
                const dataArray = await res.arrayBuffer();
                return VMTFile.fromDataArray(dataArray);
            }
        });

        prop.material = vmt;

        const vtf = await fetch(`../res/materials/models/${texPath.toLocaleLowerCase().replace('.vmt', '.vtf')}`).then(async res => {
            if(res.status == 200) {
                const dataArray = await res.arrayBuffer();
                return VTFFile.fromDataArray(dataArray);
            }
        });

        prop.texture = vtf;
        
        return fetch('../res/' + propType.replace('.mdl', '.vvd')).then(async res => {
            const arrayBuffer = await res.arrayBuffer();

            if(res.status !== 200) return;

            const vvd = VVDFile.fromDataArray(arrayBuffer);
            const meshData = vvd.convertToMesh();

            prop.meshData = meshData;

            return prop;
        });
    }
};

Comlink.expose(SourceDecoder);

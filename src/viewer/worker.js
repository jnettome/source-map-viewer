import VVDFile from 'source-bsp-lib/src/VVDFile';
import BSPFile from 'source-bsp-lib/src/BSPFile';
import VPKFile from 'source-bsp-lib/src/VPKFile';
import MDLFile from 'source-bsp-lib/src/MDLFile';

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
    loadProp(propType) {
        // mdl
        return fetch('../res/' + propType).then(async res => {
            const arrayBuffer = await res.arrayBuffer();

            if(res.status !== 200) return;

            const mdl = MDLFile.fromDataArray(arrayBuffer);

            const bounds_min = mdl.header.hull_min;
            const bounds_max = mdl.header.hull_max;
        
            return fetch('../res/' + propType.replace('.mdl', '.vvd')).then(async res => {
                const arrayBuffer = await res.arrayBuffer();
    
                if(res.status !== 200) return;
    
                const vvd = VVDFile.fromDataArray(arrayBuffer);
                const meshData = vvd.convertToMesh();

                console.log(mdl);
                console.log(vvd);
    
                return meshData;
            });
        });
    }
};

Comlink.expose(SourceDecoder);

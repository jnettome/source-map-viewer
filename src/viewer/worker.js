import VVDFile from 'source-bsp-lib/src/VVDFile';
import BSPFile from 'source-bsp-lib/src/BSPFile';

importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");
// importScripts("../../../dist/umd/comlink.js");

const SourceDecoder = {
    loadMap(bspMapPath) {
        return fetch('../res/maps/ar_shoots.bsp').then(async res => {
            const arrayBuffer = await res.arrayBuffer();
            
            const bsp = BSPFile.fromDataArray(arrayBuffer);
            const meshData = bsp.convertToMesh();
            
            return {
                meshData,
                bsp,
            };
        })
    },
    loadProp(vvdPropPath) {
        return fetch(vvdPropPath).then(async res => {
            const arrayBuffer = await res.arrayBuffer();

            if(res.status !== 200) return;

            const vvd = VVDFile.fromDataArray(arrayBuffer);
            const meshData = vvd.convertToMesh();

            return meshData;
        });
    }
};

Comlink.expose(SourceDecoder);

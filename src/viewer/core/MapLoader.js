import { Resources } from '@uncut/viewport/src/Resources';
import { BSPLevel } from './BSPLevel';

export class MapLoader {

    static async load() {
        return new Promise((resolve, reject) => {
            Resources.load().finally(() => {
                resolve(new BSPLevel());
            });
        })
    }

}

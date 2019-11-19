import { Resources } from '@uncut/viewport/src/Resources';
import { BSPLevel } from './BSPLevel';
import { Progress } from './Progress';

const prog = new Progress();

export class MapLoader {

    static get progress() {
        return prog;
    }

    static async load() {
        return new Promise((resolve, reject) => {
            Resources.load().finally(() => {
                resolve(new BSPLevel());
            });
        })
    }

}

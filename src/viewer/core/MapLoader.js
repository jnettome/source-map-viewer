import { Level } from './Level';
import { Resources } from '@uncut/viewport/src/Resources';

export class MapLoader {

    static async load() {
        return new Promise((resolve, reject) => {
            Resources.load().finally(() => {
                resolve(new Level());
            });
        })
    }

}

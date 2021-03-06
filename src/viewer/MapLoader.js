import { Resources } from '@uncut/viewport/src/resources/Resources';
import { Level } from './Level';

export class MapLoader {

    static async load() {
        return new Promise((resolve, reject) => {
            Resources.load().finally(() => {
                resolve(new Level());
            });
        })
    }

}

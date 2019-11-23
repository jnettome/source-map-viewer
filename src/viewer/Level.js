import { Scene } from '@uncut/viewport/src/scene/Scene';
import { GameState } from './Gamestate';

const gamestate = new GameState();

export class Level extends Scene {

    constructor() {
        super();

        
    }

    showPlayers() {
        gamestate.onData = data => {
            
        }
    }

}
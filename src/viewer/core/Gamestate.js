export class GameState {

    onData(state) { }

    constructor() {
        this.connect();
    }

    connect() {
        this.socket = new WebSocket("ws://127.0.0.1:3000/");

        this.socket.onopen = () => {
            this.socket.send("connected"); 
        }

        this.socket.onmessage = (event) => {
            this.onData(JSON.parse(event.data));
        }
    }

}
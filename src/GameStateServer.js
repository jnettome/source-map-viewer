const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');

const port = 3000;
const host = '127.0.0.1';

const connections = [];

const server = http.createServer( function(req, res) {

    if (req.method == 'POST') {
        res.writeHead(200, {'Content-Type': 'text/html'});

        let body = '';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {
            
            for(let socket of connections) {
                socket.send(body);
            }

        	res.end('');
        });
    }

});

const ws = new WebSocket.Server({ server });

ws.on('connection', socket => {
    console.log('new connection');
    connections.push(socket);
});

server.listen(port, host);
console.log('Listening at http://' + host + ':' + port);

const ws                = require('ws');
const httpServer        = require('../index').httpServer;

const wsconfig = {
    port: 8080,
    perMessageDeflate: {
        zlibDeflateOptions: {
        // See zlib defaults.
        chunkSize: 1024,
        memLevel: 7,
        level: 3
        },
        zlibInflateOptions: {
        chunkSize: 10 * 1024
        },
        // Other options settable:
        clientNoContextTakeover: true, // Defaults to negotiated value.
        serverNoContextTakeover: true, // Defaults to negotiated value.
        serverMaxWindowBits: 10, // Defaults to negotiated value.
        // Below options specified as default values.
        concurrencyLimit: 10, // Limits zlib concurrency for perf.
        threshold: 1024 // Size (in bytes) below which messages
        // should not be compressed.
    }
};

const webSocketServer = new ws.Server(wsconfig, httpServer);
let clients = [];
let wssMessage = {};

webSocketServer.on('connection', (ws, request) => {
    if(ws.readyState === 1 && ws.OPEN){
        let filtered = clients.filter(client => client.ws === ws);
        if(filtered.length === 0) {
            clients.push({ws, ip: request.connection.remoteAddress});
        }
        broadcastClients(clients);
        ws.on('message', async(message)=>{
            const data = JSON.parse(message);
            const targetHost = data.host;
            clients.forEach(client => {
                if (client.ip.split(':')[3] === targetHost) {
                    client.ws.send(JSON.stringify('hello socket'));
                }
            });
            if (!targetHost) {
                broadcast('Hello all');
            }
        }); 
        ws.on('close', () => {
            clients = clients.filter(client => client.ws !== ws);
            // console.log(`${request.connection.remoteAddress} disconnected.`);
            broadcastClients(clients);
        });
    }
});

const broadcastClients = (clients) => {
    let ips = [];
    clients.forEach(client => {
        if(client.ws.readyState === 1) {
            ips.push(client.ip);
        }
    });
    clients.forEach(client => {
        if(client.ws.readyState === 1) {
            client.ws.send(JSON.stringify(ips));
        }
    });
};

const broadcast = (message) => {
    clients.forEach(client => {
        if (client.ws.readyState === 1){
            client.ws.send(JSON.stringify(message));
        }
    });
};

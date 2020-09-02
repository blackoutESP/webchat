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
            console.log(message);
            broadcast(message);
            // switch(message.typing) {
            //     case 'true':
            //         wssMessage.nickname = message.nickname;
            //         wssMessage.timestamp = new Date().toString().split(' ')[4];
            //         wssMessage.message = `${wssMessage.nickname} is typing...`;
            //         wssMessage.typing = true;
            //         wssMessage.host = request.headers.host;
            //         console.log(wssMessage);
            //         break;
            //         case 'false':
            //             wssMessage.nickname = message.nickname;
            //             wssMessage.timestamp = new Date().toString().split(' ')[4];
            //             wssMessage.message = `${wssMessage.nickname} stopped typing...`;
            //             wssMessage.typing = false;
            //             wssMessage.host = request.headers.host;
            //             console.log(wssMessage);
            //             break;
            //             default:
            //                 console.log(wssMessage);
            //                 wssMessage.nickname = message.nickname;
            //                 wssMessage.timestamp = new Date().toString().split(' ')[4];
            //                 wssMessage.message = message.message;
            //                 wssMessage.typing = false;
            //                 wssMessage.host = request.headers.host;
            //                 console.log(wssMessage);
            // }
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

const broadcast = (wssMessage) => {
    clients.forEach(client => {
        if (client.ws.readyState === 1){
            client.ws.send(JSON.stringify(wssMessage));
        }
    });
};

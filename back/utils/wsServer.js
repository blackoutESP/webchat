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
let wssMessage = {
    nickname: String,
    timestamp: Date,
    message: String,
    typing: Boolean,
    host: String
};

webSocketServer.on('connection', async(ws, request)=>{

    if(ws.readyState === 1 && ws.OPEN){
        
        clients.push(ws);
        
        ws.on('message', async(message)=>{
            let data = JSON.parse(message);
            console.log(data);
            // switch(data.typing) {
            //     case 'true':
            //         wssMessage.nickname = data.nickname;
            //         wssMessage.timestamp = new Date();
            //         wssMessage.message = `${wssMessage.nickname} is typing...`;
            //         wssMessage.typing = true;
            //         wssMessage.host = request.headers.host;
            //         broadcast(wssMessage);
            //         console.log(data);
            //         break;
            //         case 'false':
            //             wssMessage.nickname = data.nickname;
            //             wssMessage.timestamp = new Date();
            //             wssMessage.message = `${wssMessage.nickname} stopped typing...`;
            //             wssMessage.typing = false;
            //             wssMessage.host = request.headers.host;
            //             broadcast(wssMessage);
            //             console.log(data);
            //             default:
            //                 wssMessage.nickname = data.nickname;
            //                 wssMessage.timestamp = new Date();
            //                 wssMessage.message = data.message;
            //                 wssMessage.typing = false;
            //                 wssMessage.host = request.headers.host;
            //                 broadcast(wssMessage);
            //                 console.log(data);
                        
                        
            // }
        }); 
        ws.on('close', async()=>{
            clients = clients.filter(client => client !== ws);
            console.log(`${request.headers.host} disconnected.`);
        });
    }
});

const broadcast = (wssMessage) => {
    clients.forEach(client => {
        if (client.readyState === 1){
            client.send(JSON.stringify(wssMessage));
        }
    });
};
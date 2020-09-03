const config        = require('./config.json');
const express       = require('express');
const http          = require('http');
const app           = express();

const indexRouter   = require('./routes/index');

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use('/api', indexRouter);

const httpServer = http.createServer(app).listen(config.http.port, '192.168.1.42', ()=>{
    console.log('server listening on *:3000');
});

require('./utils/wsServer');

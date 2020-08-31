const config        = require('./config.json');
const express       = require('express');
const http          = require('http');
const app           = express();

const indexRouter   = require('./routes/index');

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use('/api', indexRouter);

const httpServer = http.createServer(app).listen(config.http.port, ()=>{
    console.log('server listening on *:3000');
});

require('./utils/wsServer');
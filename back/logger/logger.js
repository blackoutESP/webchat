const bunyan        = require('bunyan');
const path          = require('path');
const fs            = require('fs');

let accessLog       = fs.createWriteStream(path.join(__dirname + './../logs/access.log'), { encoding: 'utf-8' });
let errorLog        = fs.createWriteStream(path.join(__dirname + './../logs/error.log'), { encoding: 'utf-8' });

let logger          = bunyan.createLogger({
    name: 'Streaming Service Logger',
    streams: [
        {
            level: 'info',
            stream: accessLog
        },
        {
            level: 'error',
            stream: errorLog
        }
    ]
});

module.exports = logger;
#!/usr/bin/env node

/**
 * Module dependencies.
 */

let app = require('../app');
let debug = require('debug')('random-number-backend:server');
let http = require('http');
const socketIO = require('socket.io');
// const Tesseract = require('tesseract.js');
const {createWorker} = require('tesseract.js');


let port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

let server = http.createServer(app);


const io = socketIO(server);
// Xử lý logic của WebSocket ở đây
io.on('connection', (socket) => {
    console.log('Client connected');

    // Khi nhận được hình ảnh từ client
    socket.on('image', (data) => {
        // Xử lý hình ảnh ở đây
        console.log('Received image:', data);

        const {image, username} = data;

        // Decode base64 image to buffer
        const imageBuffer = Buffer.from(image, 'base64');

        // Use Tesseract.js to recognize text in the image
        (async () => {
            const worker = await createWorker('eng');

            const {data: {text}} = await worker.recognize(imageBuffer);
            console.log(text);
            //toJson
            socket.emit('result', {text, username});
            await worker.terminate();
        })();
    });

    // Khi client ngắt kết nối
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});
/**
 * Get port from environment and store in Express.
 */

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}

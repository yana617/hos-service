const http = require('http');
const { Server } = require('socket.io');
// const EventEmitter = require('events');
const app = require('./app');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST'],
  },
});

require('./src/services/socket')(io);

app.io = io;

require('./src/database/connect');

// const myEmitter = new EventEmitter();
require('./src/utils/historyActionEmitter').startEmitter(io);

server.listen(process.env.PORT || 1082, () => {
  console.log(`[*] Server started on port ${server.address().port}`);
});

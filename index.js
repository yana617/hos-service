const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST'],
  },
});

app.io = io;

require('./src/database/connect');

require('./src/utils/historyActionEmitter').startEmitter(io);

server.listen(process.env.PORT || 1082, () => {
  console.log(`[*] Server started on port ${server.address().port}`);
});

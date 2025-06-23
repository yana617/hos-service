const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { startEmitter } = require('./src/utils/historyActionEmitter');

const { UI_PROD_URL, UI_NEW_PROD_URL } = process.env;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [UI_PROD_URL, UI_NEW_PROD_URL],
    methods: ['GET', 'POST'],
  },
});

app.io = io;

require('./src/database/connect');

startEmitter(io);

server.listen(process.env.PORT || 1082, () => {
  console.log(`[*] Server started on port ${server.address().port}`);
});

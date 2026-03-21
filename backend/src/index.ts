import 'dotenv/config';
import { app } from './app';
import http from 'http';
import { initWSServer, shutdownWSServer } from './websocket/ws.service';
import { setWSServer } from './websocket/ws';

const PORT = process.env.PORT;

const httpServer = http.createServer(app);
const wsServer = initWSServer(httpServer);
setWSServer(wsServer);

httpServer.listen(PORT, () => {
  console.log('Server running on port 3000');
});

process.on('SIGTERM', () => {
  shutdownWSServer();
  httpServer.close();
});

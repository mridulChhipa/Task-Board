import 'dotenv/config';
import { app } from './app';
import http from 'http';
import { initWSServer, shutdownWSServer } from './websocket/WebsocketsService';

const PORT = process.env.PORT;

const httpServer = http.createServer(app);
export const wsServer = initWSServer(httpServer);

httpServer.listen(PORT, () => {
  console.log('Server running on port 3000');
});

process.on('SIGTERM', () => {
  shutdownWSServer();
  httpServer.close();
});

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

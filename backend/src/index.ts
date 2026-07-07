import 'dotenv/config';
import { app } from './app';
import http from 'http';
import { initWSServer, shutdownWSServer } from './websocket/ws.service';
import { setWSServer } from './websocket/ws';
import { requireEnv } from './config/env';

// Fail fast on missing configuration instead of signing tokens with
// empty secrets at request time.
requireEnv('JWT_ACCESS_SECRET');
requireEnv('JWT_REFRESH_SECRET');
requireEnv('DATABASE_URL');

const PORT = Number(process.env.PORT ?? 3000);

const httpServer = http.createServer(app);
const wsServer = initWSServer(httpServer);
setWSServer(wsServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  shutdownWSServer();
  httpServer.close();
});

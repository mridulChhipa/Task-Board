import 'dotenv/config';
import { app } from './app';
import http from 'http';
import { wsServer } from './websocket/WSServer';

const PORT = process.env.PORT;

const httpServer = http.createServer(app);
wsServer.init(httpServer);

httpServer.listen(PORT, () => {
  console.log('Server running on port 3000');
});

process.on('SIGTERM', () => {
  wsServer.shutdown();
  httpServer.close();
});

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

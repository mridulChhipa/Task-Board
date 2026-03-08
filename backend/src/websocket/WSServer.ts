// import type { Server as HttpServer, IncomingMessage } from 'http';
// import { WebSocket, WebSocketServer } from 'ws';
// import { authenticateWSRequest } from './WSMiddleware';
// import { wsEventEmitter, NOTIFICATION_EVENT } from './WSEventEmitter';
// import type { NotificationEvent } from './WSEventEmitter';

// interface AuthenticatedSocket extends WebSocket {
//   userId?: string;
//   isAlive?: boolean;
// }

// class WSServer {
//   private registry: Map<string, Set<AuthenticatedSocket>> = new Map();
//   private wss: WebSocketServer | null = null;
//   private heartbeatInterval: NodeJS.Timeout | null = null;

//   init(httpServer: HttpServer): void {
//     this.wss = new WebSocketServer({ server: httpServer });

//     console.log('[WSServer] Attached to HTTP server');

//     this.wss.on('connection', (socket: AuthenticatedSocket, req) => {
//       this.handleConnection(socket, req);
//     });

//     this.startHeartbeat();
//     this.subscribeToEvents();
//   }

//   private handleConnection(
//     socket: AuthenticatedSocket,
//     req: IncomingMessage,
//   ): void {
//     const { valid, userId } = authenticateWSRequest(req);

//     if (!valid || !userId) {
//       socket.close(1008, 'Unauthorized'); // 1008 = Policy Violation
//       return;
//     }

//     socket.userId = userId;
//     socket.isAlive = true;

//     this.addToRegistry(userId, socket);
//     console.log(
//       `[WSServer] User ${userId} connected. Active connections: ${this.getConnectionCount()}`,
//     );
//     this.send(socket, {
//       type: 'CONNECTED',
//       message: 'WebSocket connection established',
//     });

//     // Heartbeat pong response
//     socket.on('pong', () => {
//       socket.isAlive = true;
//     });

//     // Client can send { type: 'PING' } to test connection
//     socket.on('message', (data) => {
//       try {
//         const parsed = JSON.parse(data.toString());
//         if (parsed.type === 'PING') {
//           this.send(socket, { type: 'PONG' });
//         }
//       } catch {
//         // Ignore malformed messages
//       }
//     });

//     // Cleanup on disconnect
//     socket.on('close', () => {
//       this.removeFromRegistry(userId, socket);
//       console.log(
//         `[WSServer] User ${userId} disconnected. Active connections: ${this.getConnectionCount()}`,
//       );
//     });

//     socket.on('error', (err) => {
//       console.error(`[WSServer] Socket error for user ${userId}:`, err.message);
//       this.removeFromRegistry(userId, socket);
//     });
//   }

//   private subscribeToEvents(): void {
//     // Listen to the event bus — notificationService emits here after DB write
//     wsEventEmitter.on(NOTIFICATION_EVENT, (event: NotificationEvent) => {
//       this.fanOut(event);
//     });
//   }

//   private fanOut(event: NotificationEvent): void {
//     const payload = {
//       type: event.type,
//       notificationId: event.notificationId,
//       actorName: event.actorName,
//       entityType: event.entityType,
//       entityId: event.entityId,
//       message: event.message,
//       createdAt: event.createdAt,
//     };

//     for (const recipientId of event.recipientIds) {
//       const sockets = this.registry.get(recipientId);

//       if (!sockets || sockets.size === 0) {
//         // User is offline — notification is already in DB, they'll fetch on login
//         continue;
//       }

//       for (const socket of sockets) {
//         if (socket.readyState === WebSocket.OPEN) {
//           this.send(socket, payload);
//         } else {
//           // Prune dead socket
//           sockets.delete(socket);
//         }
//       }
//     }
//   }

//   private startHeartbeat(): void {
//     // Ping all clients every 30 seconds
//     this.heartbeatInterval = setInterval(() => {
//       if (!this.wss) {
//         return;
//       }

//       this.wss.clients.forEach((rawSocket) => {
//         const socket = rawSocket as AuthenticatedSocket;

//         if (!socket.isAlive) {
//           // No pong received since last ping — terminate
//           socket.terminate();
//           if (socket.userId) {
//             this.removeFromRegistry(socket.userId, socket);
//           }
//           return;
//         }

//         socket.isAlive = false; // reset — will be set back to true on pong
//         socket.ping();
//       });
//     }, 30_000);
//   }

//   private addToRegistry(userId: string, socket: AuthenticatedSocket): void {
//     if (!this.registry.has(userId)) {
//       this.registry.set(userId, new Set());
//     }

//     const sockets = this.registry.get(userId);
//     if (sockets !== undefined) {
//       sockets.add(socket);
//     }
//   }
//   private removeFromRegistry(
//     userId: string,
//     socket: AuthenticatedSocket,
//   ): void {
//     const sockets = this.registry.get(userId);
//     if (!sockets) {
//       return;
//     }

//     sockets.delete(socket);

//     if (sockets.size === 0) {
//       this.registry.delete(userId); // clean up empty entries
//     }
//   }

//   private getConnectionCount(): number {
//     let count = 0;
//     for (const sockets of this.registry.values()) {
//       count += sockets.size;
//     }
//     return count;
//   }

//   private send(socket: AuthenticatedSocket, payload: object): void {
//     if (socket.readyState === WebSocket.OPEN) {
//       socket.send(JSON.stringify(payload));
//     }
//   }

//   shutdown(): void {
//     if (this.heartbeatInterval) {
//       clearInterval(this.heartbeatInterval);
//     }
//     this.wss?.close();
//     console.log('[WSServer] Shut down');
//   }
// }

// export const wsServer = new WSServer();
